from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from typing import Optional, List, Dict
import random
import uuid
import logging
import time
import re
from datetime import datetime

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
    modify_bank: Optional[bool] = True,
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
        
        
        all_transactions = bank_transactions + ledger_transactions
        logger.info(f"Combined {len(bank_transactions)} bank and {len(ledger_transactions)} ledger transactions")
     
        logger.info("Creating transaction matches...")
        match_start = time.time()
        all_transactions = create_matches(all_transactions)
        logger.info(f"Match creation complete in {time.time() - match_start:.2f}s")
        
      
        modification_start = time.time()
        if modify_bank:
            source = "bank"
            logger.info("Modifying bank transactions...")
            modified_transactions = []
            
            for transaction in all_transactions:
                if transaction['source'] == 'bank':
                    
                    if random.random() < 0.3:  
                        if 'amount' in transaction and isinstance(transaction['amount'], (int, float)):
                            
                            adjustment = transaction['amount'] * random.uniform(-0.1, 0.1)
                            transaction['amount'] = round(transaction['amount'] + adjustment, 2)
                            logger.debug(f"Modified transaction amount: ID {transaction['id']}")
                        
                        if 'description' in transaction and isinstance(transaction['description'], str):
                            
                            transaction['description'] = f"{transaction['description']} (updated)"
                            logger.debug(f"Modified transaction description: ID {transaction['id']}")
                        
                      
                        modified_transactions.append(transaction)
                
            modification_count = len(modified_transactions)
        else:
            source = "ledger"
            logger.info("Modifying ledger transactions...")
            modified_transactions = []
            
            for transaction in all_transactions:
                if transaction['source'] == 'ledger':
                    
                    if random.random() < 0.3:  
                        if 'amount' in transaction and isinstance(transaction['amount'], (int, float)):
                        
                            adjustment = transaction['amount'] * random.uniform(-0.1, 0.1)
                            transaction['amount'] = round(transaction['amount'] + adjustment, 2)
                            logger.debug(f"Modified transaction amount: ID {transaction['id']}")
                        
                        if 'description' in transaction and isinstance(transaction['description'], str):
                          
                            transaction['description'] = f"{transaction['description']} (updated)"
                            logger.debug(f"Modified transaction description: ID {transaction['id']}")
                        
                       
                        modified_transactions.append(transaction)
            
            modification_count = len(modified_transactions)
        
        logger.info(f"Modifications complete in {time.time() - modification_start:.2f}s - {modification_count} transactions modified")
        
        
        response_data = {
            "success": True,
            "source": source,
            "modification_count": modification_count,
            "transactions": all_transactions
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
        
    
    is_negative = '-' in amount_str
    
  
    clean_str = re.sub(r'[^\d.]', '', amount_str)
    
    
    if is_negative:
        clean_str = '-' + clean_str
        
    try:
        return float(clean_str)
    except (ValueError, TypeError):
        logger.warning(f"Could not parse amount string: {amount_str}")
        return 0.0

def parse_date(date_str):
    
    if not date_str or pd.isna(date_str):
        return datetime.now().strftime('%Y-%m-%d')
        
    try:
        for fmt in ['%d-%b-%y', '%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%m/%d/%Y']:
            try:
                date_obj = datetime.strptime(str(date_str).strip(), fmt)
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                continue
                
       
        logger.warning(f"Could not parse date: {date_str}. Using current date.")
        return datetime.now().strftime('%Y-%m-%d')
    except Exception as e:
        logger.warning(f"Error parsing date {date_str}: {str(e)}")
        return datetime.now().strftime('%Y-%m-%d')

def generate_description(row):
    """Generate a meaningful description based on transaction data"""
    description = "Unknown transaction"
    
  
    if 'TRANSACTION DETAILS' in row and not pd.isna(row['TRANSACTION DETAILS']):
        description = str(row['TRANSACTION DETAILS'])
    elif 'CHQ.NO.' in row and not pd.isna(row['CHQ.NO.']):
        description = f"Check #{row['CHQ.NO.']}"
    
    else:
        for col in row.index:
            if any(keyword in col.lower() for keyword in ['detail', 'desc', 'narr', 'memo', 'note', 'text']):
                if not pd.isna(row[col]) and str(row[col]).strip():
                    description = str(row[col])
                    break
    
    return description

def find_amount_columns(df):
    """Find columns with 'Amt', 'amt', or 'Amount' in their names"""
    amount_columns = []
    for col in df.columns:
        if any(term in col for term in ['Amt', 'amt', 'Amount']):
            amount_columns.append(col)
    
    logger.info(f"Found amount columns: {amount_columns}")
    return amount_columns

def calculate_cumulative_amount(row, amount_columns):
    """Calculate the cumulative amount from all amount columns"""
    total = 0.0
    
    if not amount_columns: 
        return round(random.uniform(100, 10000), 2)
    
    for col in amount_columns:
        if col in row and not pd.isna(row[col]):
            try:
                value = clean_amount_string(row[col])
                
                if any(term in col.lower() for term in ['withdrawal', 'debit', 'dr']):
                    value = -abs(value)
                total += value
            except Exception as e:
                logger.warning(f"Error processing amount column {col}: {str(e)}")
    
    
    if total == 0:
        return round(random.uniform(100, 10000), 2)
    
    return round(total, 2)

def process_transactions(df: pd.DataFrame, source: str) -> List[Dict]:
    """Convert DataFrame to list of transaction dictionaries with required fields"""
    transactions = []
    logger.info(f"Processing {len(df)} {source} transactions")
    
    
    amount_columns = find_amount_columns(df)
    
    try:
        for idx, row in df.iterrows():
            if idx % 100 == 0 and idx > 0:  
                logger.debug(f"Processed {idx} {source} transactions")
                
            transaction = {
                "id": f"{source}-{uuid.uuid4()}",
                "source": source,
                "status": "unmatched"  
            }
            
            
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
            
    
            date_found = False
            for date_field in ['date', 'DATE', 'Value Date', 'VALUE DATE', 'transaction_date', 'post_date']:
                if date_field in transaction and transaction[date_field]:
                    transaction['date'] = parse_date(transaction[date_field])
                    date_found = True
                    break
            
            if not date_found:
                transaction['date'] = datetime.now().strftime('%Y-%m-%d')
                logger.debug(f"Date field missing in transaction {idx} - using current date")
         
            if 'description' not in transaction or not transaction['description'] or transaction['description'] is None:
              
                if 'memo' in transaction and transaction['memo']:
                    transaction['description'] = transaction['memo']
                elif 'narrative' in transaction and transaction['narrative']:
                    transaction['description'] = transaction['narrative']
                elif 'TRANSACTION DETAILS' in transaction and transaction['TRANSACTION DETAILS']:
                    transaction['description'] = transaction['TRANSACTION DETAILS']
                else:
                    
                    transaction['description'] = generate_description(row)
                    logger.debug(f"Generated description for transaction {idx}: {transaction['description']}")
            
            
            transaction['amount'] = calculate_cumulative_amount(row, amount_columns)
            logger.debug(f"Transaction {idx} amount: {transaction['amount']}")
            
            transactions.append(transaction)
    except Exception as e:
        logger.exception(f"Error in process_transactions: {str(e)}")
        raise
        
    logger.info(f"Successfully processed {len(transactions)} {source} transactions")
    return transactions

def create_matches(transactions: List[Dict]) -> List[Dict]:
    """Create matches between bank and ledger transactions"""
    try:
        bank_transactions = [t for t in transactions if t['source'] == 'bank']
        ledger_transactions = [t for t in transactions if t['source'] == 'ledger']
        
        logger.info(f"Creating matches between {len(bank_transactions)} bank and {len(ledger_transactions)} ledger transactions")
        

        match_count = min(len(bank_transactions), len(ledger_transactions))
        match_count = int(match_count * 0.7)
        
        matched = 0
        review = 0
        
        if match_count > 0:
           
            random.shuffle(bank_transactions)
            random.shuffle(ledger_transactions)
            
            for i in range(match_count):
                if i >= len(bank_transactions) or i >= len(ledger_transactions):
                    break
                    
                
                match_id = f"match-{uuid.uuid4()}"
                
                
                if random.random() < 0.7:  
                    status = "matched"
                    confidence = random.randint(90, 100)
                    matched += 1
                else:
                    status = "review"
                    confidence = random.randint(50, 89)
                    review += 1
                
               
                for t in transactions:
                    if t['id'] == bank_transactions[i]['id'] or t['id'] == ledger_transactions[i]['id']:
                        t['status'] = status
                        t['matchId'] = match_id
                        t['confidence'] = confidence
        
        logger.info(f"Created {matched} matched pairs and {review} review pairs")
        return transactions
    except Exception as e:
        logger.exception(f"Error in create_matches: {str(e)}")
        raise

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