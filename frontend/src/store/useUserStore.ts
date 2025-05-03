import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import axios from "axios"
import { toast } from "sonner";
import { SignupFormData } from "@/types/SignUp";
import { SigninFormData } from "@/types/Signin";
const API_END_POINT = "http://localhost:9000";
axios.defaults.withCredentials = true;

type User = {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    Company_name: string;
    profilePicture: string;
}

type UserState = {
    user: User | null;
    isAuthenticated: boolean;
    isCheckingAuth: boolean;
    isSubmitting: boolean;
    signup: (input: SignupFormData) => Promise<void>;
    login: (input: SigninFormData) => Promise<void>;
    checkAuthentication: () => Promise<void>;
    logout: () => Promise<void>;
}
export const useUserStore = create<UserState>()(persist((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true,
    isSubmitting: false,
    signup: async (input: SignupFormData) => {
        try {
            set({ isSubmitting: true });
            const response = await axios.post(`${API_END_POINT}/signup`, {
                email:input.email,
                password:input.password,
                Company_Name:input.companyName,
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (response.data.success) {
                toast.success("Account created successfully");
                set({ isSubmitting: false, user: response.data, isAuthenticated: true })
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An unknown error occurred");
            }
            set({ isSubmitting: false});
        }
    },
    login: async (input: SigninFormData) => {
        try {
            set({ isSubmitting: true });
            const response = await axios.post(`${API_END_POINT}/signin`, {
                email: input.email,
                password: input.password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if (response.data.success) {
                toast.success("Logged in successfully");
                set({ isSubmitting: false, user: response.data, isAuthenticated: true });
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message)
            }
            else {
                toast.error("An unknown error occurred")
            }
            set({ isSubmitting: false });
        }
    },
    
    checkAuthentication: async () => {
        try {
            set({ isCheckingAuth: true });
            const response = await axios.get(`${API_END_POINT}/getUserProfile`);
            if (response.data.success) {
                set({ user: response.data, isAuthenticated: true, isCheckingAuth: false });
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message)
            }
            else {
                toast.error("An unknown error occurred")
            }
            set({ isAuthenticated: false, isCheckingAuth: false });
        }
    },
    logout: async () => {
        try {
            set({ isSubmitting: true });
            const response = await axios.post(`${API_END_POINT}/logout`);
            if (response.data.success) {
                toast.success(response.data.message);
                set({ isSubmitting: false, user: null, isAuthenticated: false })
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message)
            }
            else {
                toast.error("An unknown error occurred")
            }
            set({isSubmitting:false });
        }
    },
}),
    {
        name: 'user-name',
        storage: createJSONStorage(() => localStorage)
    }
))