import React, { useState } from 'react';

const UserForm =({onSubmit,isLogin}) => {
    const [email , setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefalut();
        setError('');

        if(!email || !password){
            setError("Please fill in all fields");
            return;
        }

        onSubmit({
            email,
            password
        });
    };

    return(
        <form onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <div>
                <label>Email:</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <label>Password:</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
            </div>
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>  
        </form>
    )
};