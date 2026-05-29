import { useState, useEffect } from 'react';
import { type Bean } from '../types/index.js';

export default function Catalog() {
    const [beans, setBeans] = useState<Bean[]>([]);

    useEffect(() => {
        fetch('http://localhost:3000/beans').then(res => res.json())
            .then(data => setBeans(data));
    }, []);

    return (
        <div>
            <div className="flex gap-4 mt-3 items-center place-content-center">
                <h1 className="text-5xl font-bold text-stone-950">Bean Catalog</h1>
                <img className="h-15 max-w-full object-cover rounded-lg" src="../../assets/6605.png"></img>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4">
                {
                    beans.map(bean => (
                        <div className="bg-white rounded-2xl border border-brown-200" key={bean.id}>
                            <div className="p-6">
                                <div className="text-left">
                                    <h2 className="text-xl font-bold text-stone-950 mb-2">{bean.name}</h2>
                                    <p className="font-bold text-slate-600">{bean.roaster.name}</p>
                                    <p className="flex-auto text-stone-500 italic">Notes: {bean.flavourNotes}</p>
                                    <div>
                                        <button type="button" className="flex gap-2 mt-3 font-bold text-neutral-950 hover:text-blue-500 transition">
                                            Learn more
                                            <svg className="w-5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};