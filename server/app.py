from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from typing import Optional, List, Dict, Any, Tuple
import uuid
import logging
import time
import re
from datetime import datetime
from fuzzywuzzy import fuzz, process
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("bank-reconciliation")

app = FastAPI(title="Bank Reconciliation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

@app.post("/reconcile")
async def reconcile_files(
    bank: UploadFile = File(...),
    ledger: UploadFile = File(...),
    fuzzy_threshold: Optional[int] = 80,  
    max_rows: Optional[int] = None 
):
    start_time = time.time()
    logger.info(f"Reconciliation started - Bank file: {bank.filename}, Ledger file: {ledger.filename}")
    
    if bank.content_type != "text/csv" and not bank.filename.endswith('.csv'):
        logger.error(f"Invalid bank file format: {bank.content_type}, {bank.filename}")
        raise HTTPException(status_code=400, detail="Bank file must be a CSV file")
    
    if ledger.content_type != "text/csv" and not ledger.filename.endswith('.csv'):
        logger.error(f"Invalid ledger file format: {ledger.content_type}, {ledger.filename}")
        raise HTTPException(status_code=400, detail="Ledger file must be a CSV file")
    
    try:
        logger.info("Reading bank file...")
        bank_read_start = time.time()
        bank_contents = await bank.read()
        bank_df = pd.read_csv(io.BytesIO(bank_contents))
        logger.info(f"Bank file read complete in {time.time() - bank_read_start:.2f}s - {len(bank_df)} rows")
        
        if max_rows and len(bank_df) > max_rows:
            logger.info(f"Limiting bank data to {max_rows} rows for testing")
            bank_df = bank_df.head(max_rows)
        
        logger.info("Reading ledger file...")
        ledger_read_start = time.time()
        ledger_contents = await ledger.read()
        ledger_df = pd.read_csv(io.BytesIO(ledger_contents))
        logger.info(f"Ledger file read complete in {time.time() - ledger_read_start:.2f}s - {len(ledger_df)} rows")
        
        if max_rows and len(ledger_df) > max_rows:
            logger.info(f"Limiting ledger data to {max_rows} rows for testing")
            ledger_df = ledger_df.head(max_rows)
        
        logger.info(f"Bank columns: {bank_df.columns.tolist()}")
        logger.info(f"Ledger columns: {ledger_df.columns.tolist()}")
        
        logger.info("Processing bank transactions...")
        process_start = time.time()
        bank_transactions = process_transactions(bank_df, 'bank')
        logger.info(f"Bank processing complete in {time.time() - process_start:.2f}s")
        
        logger.info("Processing ledger transactions...")
        process_start = time.time()
        ledger_transactions = process_transactions(ledger_df, 'ledger')
        logger.info(f"Ledger processing complete in {time.time() - process_start:.2f}s")
        
        logger.info("Finding matches and mismatches using fuzzy matching...")
        match_start = time.time()
        matched_transactions, mismatches = find_matches_and_mismatches(
            bank_transactions, 
            ledger_transactions, 
            fuzzy_threshold
        )
        logger.info(f"Matching complete in {time.time() - match_start:.2f}s")
        
        # Combine all transactions
        all_transactions = matched_transactions + [t for t in bank_transactions if t.get('status') == 'unmatched'] + [t for t in ledger_transactions if t.get('status') == 'unmatched']
        
        logger.info(f"Found {len(mismatches)} mismatches between bank and ledger transactions")
        
        response_data = {
            "success": True,
            "transactions": all_transactions,
            "mismatches": mismatches
        }
        
        total_time = time.time() - start_time
        logger.info(f"Reconciliation complete in {total_time:.2f}s")
        
        return JSONResponse(content=response_data)
    
    except pd.errors.EmptyDataError:
        logger.error("Empty CSV file detected")
        raise HTTPException(status_code=400, detail="One of the uploaded CSV files is empty")
    
    except pd.errors.ParserError as e:
        logger.error(f"CSV parsing error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error parsing CSV files: {str(e)}")
    
    except Exception as e:
        logger.exception(f"Unexpected error during reconciliation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred during reconciliation: {str(e)}")

def clean_amount_string(amount_str):
    """Clean amount strings that might contain formatting like commas, periods, or currency symbols"""
    if not isinstance(amount_str, str):
        return amount_str
    
    # Handle negative amounts with different formats (e.g., -100, (100), 100-)
    is_negative = '-' in amount_str or amount_str.endswith('-') or amount_str.startswith('(') and amount_str.endswith(')')
    
    # Remove all non-numeric characters except decimal point
    clean_str = re.sub(r'[^\d.]', '', amount_str)
    
    # Apply negative sign if needed
    if is_negative:
        clean_str = '-' + clean_str
    
    try:
        return float(clean_str)
    except (ValueError, TypeError):
        logger.warning(f"Could not parse amount string: {amount_str}")
        return None  # Return None instead of 0.0 for genuine handling

def parse_date(date_str):
    """Parse date strings in various formats"""
    if not date_str or pd.isna(date_str):
        return None  # Return None instead of current date for genuine handling
    
    try:
        for fmt in ['%d-%b-%y', '%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%m/%d/%Y', '%d-%b-%Y']:
            try:
                date_obj = datetime.strptime(str(date_str).strip(), fmt)
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        logger.warning(f"Could not parse date: {date_str}")
        return None  # Return None instead of current date
    
    except Exception as e:
        logger.warning(f"Error parsing date {date_str}: {str(e)}")
        return None  # Return None instead of current date

def get_description_from_transaction(row):
    """Extract meaningful description from transaction row"""
    # Check common description fields
    description_fields = [
        'TRANSACTION DETAILS', 'DESCRIPTION', 'Description', 'NARRATION', 
        'PARTICULARS', 'Memo', 'MEMO', 'NARRATIVE', 'Details', 'TEXT'
    ]
    
    for field in description_fields:
        if field in row and not pd.isna(row[field]) and str(row[field]).strip():
            return str(row[field])
    
    # Check for check/cheque number
    if 'CHQ.NO.' in row and not pd.isna(row['CHQ.NO.']):
        return f"Check #{row['CHQ.NO.']}"
    
    # Look for any column with description-like names
    for col in row.index:
        if any(keyword in col.lower() for keyword in ['detail', 'desc', 'narr', 'memo', 'note', 'text', 'part']):
            if not pd.isna(row[col]) and str(row[col]).strip():
                return str(row[col])
    
    # Return None if no description found (instead of "Unknown transaction")
    return None

def find_amount_columns(df):
    """Find columns related to transaction amounts"""
    amount_columns = {
        'debit': [],
        'credit': [],
        'general': []
    }
    
    for col in df.columns:
        col_lower = col.lower()
        
        # Check for debit columns
        if any(term in col_lower for term in ['withdrawal', 'debit', 'dr', 'dr.', 'with']):
            amount_columns['debit'].append(col)
        
        # Check for credit columns
        elif any(term in col_lower for term in ['deposit', 'credit', 'cr', 'cr.', 'dep']):
            amount_columns['credit'].append(col)
        
        # Check for general amount columns
        elif any(term in col.lower() for term in ['amt', 'amount', 'sum', 'val', 'value']):
            amount_columns['general'].append(col)
    
    logger.info(f"Found amount columns: {amount_columns}")
    return amount_columns

def calculate_transaction_amount(row, amount_columns):
    """Calculate transaction amount from all amount-related columns"""
    amount = 0.0
    amount_found = False
    
    # Process debit columns (negative amounts)
    for col in amount_columns['debit']:
        if col in row and not pd.isna(row[col]) and row[col] != '':
            value = clean_amount_string(row[col])
            if value is not None:
                amount -= abs(value)
                amount_found = True
    
    # Process credit columns (positive amounts)
    for col in amount_columns['credit']:
        if col in row and not pd.isna(row[col]) and row[col] != '':
            value = clean_amount_string(row[col])
            if value is not None:
                amount += abs(value)
                amount_found = True
    
    # If no specific debit/credit columns found, use general amount columns
    if not amount_found:
        for col in amount_columns['general']:
            if col in row and not pd.isna(row[col]) and row[col] != '':
                value = clean_amount_string(row[col])
                if value is not None:
                    amount += value
                    amount_found = True
    
    # If still no amount found, return None instead of random value
    if not amount_found:
        return None
    
    return round(amount, 2)

def process_transactions(df: pd.DataFrame, source: str) -> List[Dict]:
    """Convert DataFrame to list of transaction dictionaries with required fields"""
    transactions = []
    logger.info(f"Processing {len(df)} {source} transactions")
    
    amount_columns = find_amount_columns(df)
    
    try:
        for idx, row in df.iterrows():
            if idx % 100 == 0 and idx > 0:  
                logger.debug(f"Processed {idx} {source} transactions")
            
            # Create base transaction object
            transaction = {
                "id": f"{source}-{uuid.uuid4()}",
                "source": source,
                "status": "unmatched",
                "row_index": idx  # Store original row index for reference
            }
            
            # Transfer all columns from the CSV
            for column, value in row.items():
                try:
                    if pd.isna(value):  
                        transaction[column] = None
                    elif pd.api.types.is_numeric_dtype(pd.Series([value])):
                        transaction[column] = float(value) if '.' in str(value) else int(value)
                    else:
                        transaction[column] = str(value)
                except Exception as e:
                    logger.warning(f"Error processing column {column} with value {value}: {str(e)}")
                    transaction[column] = str(value) if value is not None else None
            
            # Process date
            date_value = None
            for date_field in ['date', 'DATE', 'Value Date', 'VALUE DATE', 'transaction_date', 'post_date', 'Transaction Date', 'Date']:
                if date_field in transaction and transaction[date_field]:
                    date_value = parse_date(transaction[date_field])
                    if date_value:
                        break
            
            transaction['date'] = date_value
            
            # Process description
            description = get_description_from_transaction(row)
            transaction['description'] = description
            
            # Process amount
            transaction['amount'] = calculate_transaction_amount(row, amount_columns)
            
            # Add transaction to list
            transactions.append(transaction)
    
    except Exception as e:
        logger.exception(f"Error in process_transactions: {str(e)}")
        raise
    
    logger.info(f"Successfully processed {len(transactions)} {source} transactions")
    return transactions

def create_fingerprint(transaction: Dict) -> str:
    """Create a fingerprint for fuzzy matching based on key transaction attributes"""
    fingerprint_parts = []
    
    # Add date if available
    if transaction.get('date'):
        fingerprint_parts.append(str(transaction['date']))
    
    # Add description if available
    if transaction.get('description'):
        fingerprint_parts.append(str(transaction['description']))
    
    # Add amount if available
    if transaction.get('amount') is not None:
        fingerprint_parts.append(f"{transaction['amount']:.2f}")
    
    # Join all parts
    return " ".join(fingerprint_parts)

def compare_amounts(amount1, amount2, tolerance=0.01):
    """Compare two amounts with a tolerance for minor discrepancies"""
    # Handle None values
    if amount1 is None or amount2 is None:
        return False
    
    # Check if the difference is within tolerance
    return abs(amount1 - amount2) <= tolerance

def find_matches_and_mismatches(bank_transactions: List[Dict], ledger_transactions: List[Dict], 
                               threshold: int = 80) -> Tuple[List[Dict], List[Dict]]:
    """
    Find matches between bank and ledger transactions using fuzzy matching,
    and identify mismatches in amounts and descriptions.
    """
    matched_transactions = []
    mismatches = []
    
    # Create fingerprints for all transactions
    bank_fingerprints = {t['id']: create_fingerprint(t) for t in bank_transactions}
    ledger_fingerprints = {t['id']: create_fingerprint(t) for t in ledger_transactions}
    
    # Process each bank transaction
    for bank_tx in bank_transactions:
        bank_id = bank_tx['id']
        bank_fingerprint = bank_fingerprints[bank_id]
        
        # Skip transactions with insufficient data for matching
        if not bank_fingerprint.strip():
            continue
        
        # Find potential matches using fuzzy matching
        matches = []
        for ledger_id, ledger_fingerprint in ledger_fingerprints.items():
            if not ledger_fingerprint.strip():
                continue
                
            # Calculate similarity score
            score = fuzz.token_sort_ratio(bank_fingerprint, ledger_fingerprint)
            if score >= threshold:
                matches.append((ledger_id, score))
        
        # Sort matches by score (highest first)
        matches.sort(key=lambda x: x[1], reverse=True)
        
        if matches:
            best_match_id, match_score = matches[0]
            
            # Find the matching ledger transaction
            ledger_tx = next((t for t in ledger_transactions if t['id'] == best_match_id), None)
            
            if ledger_tx:
                # Create a match ID
                match_id = f"match-{uuid.uuid4()}"
                
                # Check for discrepancies
                discrepancies = []
                
                # Compare amounts
                bank_amount = bank_tx.get('amount')
                ledger_amount = ledger_tx.get('amount')
                
                if bank_amount is not None and ledger_amount is not None:
                    if not compare_amounts(bank_amount, ledger_amount):
                        discrepancies.append({
                            "type": "amount",
                            "bank_value": bank_amount,
                            "ledger_value": ledger_amount,
                            "difference": round(bank_amount - ledger_amount, 2)
                        })
                
                # Compare descriptions if both exist
                bank_desc = bank_tx.get('description')
                ledger_desc = ledger_tx.get('description')
                
                if bank_desc and ledger_desc:
                    desc_score = fuzz.token_sort_ratio(bank_desc, ledger_desc)
                    if desc_score < threshold:
                        discrepancies.append({
                            "type": "description",
                            "bank_value": bank_desc,
                            "ledger_value": ledger_desc,
                            "similarity": desc_score
                        })
                
                # Set match status based on discrepancies
                if discrepancies:
                    status = "review"
                    confidence = match_score
                    
                    # Add to mismatches list
                    mismatch = {
                        "match_id": match_id,
                        "bank_transaction": bank_tx,
                        "ledger_transaction": ledger_tx,
                        "discrepancies": discrepancies,
                        "match_score": match_score
                    }
                    mismatches.append(mismatch)
                else:
                    status = "matched"
                    confidence = match_score

                bank_tx['status'] = status
                bank_tx['matchId'] = match_id
                bank_tx['confidence'] = confidence
                matched_transactions.append(bank_tx)
                ledger_tx['status'] = status
                ledger_tx['matchId'] = match_id
                ledger_tx['confidence'] = confidence
                matched_transactions.append(ledger_tx)
                ledger_fingerprints[best_match_id] = ""
    
    return matched_transactions, mismatches

@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to the Bank Reconciliation API",
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Bank Reconciliation API server")
    uvicorn.run(app, host="0.0.0.0", port=8000)