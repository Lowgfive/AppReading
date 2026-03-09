import React, { createContext, useState, useContext, PropsWithChildren } from "react";

type AuthFormContextType = {
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    username: string;
    setUsername: (val: string) => void;
    confirmPassword: string;
    setConfirmPassword: (val: string) => void;
    resetForm: () => void;
};

const AuthFormContext = createContext<AuthFormContextType>({
    email: "",
    setEmail: () => { },
    password: "",
    setPassword: () => { },
    username: "",
    setUsername: () => { },
    confirmPassword: "",
    setConfirmPassword: () => { },
    resetForm: () => { },
});

export const useAuthForm = () => useContext(AuthFormContext);

export default function AuthFormProvider({ children }: PropsWithChildren) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setUsername("");
        setConfirmPassword("");
    };

    return (
        <AuthFormContext.Provider
            value={{
                email,
                setEmail,
                password,
                setPassword,
                username,
                setUsername,
                confirmPassword,
                setConfirmPassword,
                resetForm,
            }}
        >
            {children}
        </AuthFormContext.Provider>
    );
}
