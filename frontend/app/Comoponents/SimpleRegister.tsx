'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleRegister() {
    const router = useRouter();
    const [nickname, setNickname] = useState('');
    const [fullname, setFullname] = useState('');

    const handleSubmit = (e:React.FormEvent) => {
        e.preventDefault();
        if (nickname && fullname) {
            router.push(`/chat?nickname=${nickname}&fullname=${fullname}`);
        }
    };
    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <form
                className="bg-white p-8 rounded-lg shadow-md"
                onSubmit={handleSubmit}
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                <div className="mb-4">
                    <label htmlFor="nickname" className="block text-gray-700">
                        Nickname
                    </label>
                    <input
                        type="text"
                        id="nickname"
                        className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:border-indigo-500"
                        onChange={(e) => setNickname(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="fullname" className="block text-gray-700">
                        Fullname
                    </label>
                    <input
                        type="text"
                        id="fullname"
                        className="border border-gray-300 rounded-md w-full px-3 py-2 focus:outline-none focus:border-indigo-500"
                        onChange={(e) => setFullname(e.target.value)}
                    />
                </div>
                <button
                    className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:shadow-outline-indigo"
                    type="submit"
                >
                    Register
                </button>
            </form>
        </div>
    );
}
