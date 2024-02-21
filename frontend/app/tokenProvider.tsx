'use client'
import React, { createContext, useState, useContext, use } from 'react';

interface UserContextType {
    user: { nickname: string; fullname: string } | null;
    setUser: React.Dispatch<React.SetStateAction<{ nickname: string; fullname: string } | null>>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
});

export const TokenProvider: React.FC = ({ children }: any) => {
    const [user, setUser] = useState<{ nickname: string; fullname: string } | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useTokenContext = () => useContext(UserContext);
