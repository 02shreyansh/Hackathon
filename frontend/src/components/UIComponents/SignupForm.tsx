import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react';
import { SignupFormData, signupSchema } from '@/types/SignUp';
import { useForm } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useUserStore } from '@/store/useUserStore';
import { useNavigate } from 'react-router-dom';

export const SignupForm=()=> {
    const {signup,isSubmitting}=useUserStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        mode: 'onChange',
    });

    const password = watch('password', '');

    const onSubmit = async (data: SignupFormData) => {
        try {
            await signup(data);
            navigate('/auth');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error))
        }
    };
    const passwordCriteria = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
        { label: 'At least one number', met: /[0-9]/.test(password) },
        { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(password) },
    ];
    const strengthPercentage =
        passwordCriteria.reduce((acc, criterion) => criterion.met ? acc + 20 : acc, 0);

    const getStrengthColor = () => {
        if (strengthPercentage <= 20) return 'bg-red-500';
        if (strengthPercentage <= 60) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                <p className="mt-2 text-gray-600">Start automating your reconciliation process today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                            }`}
                        placeholder="you@company.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                                }`}
                            placeholder="Create a strong password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                    {password && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${getStrengthColor()}`}
                                    style={{ width: `${strengthPercentage}%` }}
                                ></div>
                            </div>
                            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {passwordCriteria.map((criterion, index) => (
                                    <li key={index} className="flex items-center text-sm">
                                        {criterion.met ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-gray-400 mr-1" />
                                        )}
                                        <span className={criterion.met ? 'text-green-700' : 'text-gray-500'}>
                                            {criterion.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...register('confirmPassword')}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                                }`}
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                    </label>
                    <input
                        id="companyName"
                        type="text"
                        {...register('companyName')}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.companyName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                            }`}
                        placeholder="Your company name"
                    />
                    {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                    )}
                </div>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="agreeToTerms"
                            type="checkbox"
                            {...register('agreeToTerms')}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="agreeToTerms" className="text-gray-700">
                            I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </label>
                        {errors.agreeToTerms && (
                            <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                        )}
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                ${isValid && !isSubmitting
                                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                : 'bg-blue-400 cursor-not-allowed'}`}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>
            </form>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/signin" className="font-medium text-blue-600 hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}