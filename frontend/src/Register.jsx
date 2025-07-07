import React,{useState} from 'react';
export const Register =(props) =>{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(email);
    }

    return (
        <div className='auth-form-container'>
            <form className='register-form' onSubmit={handleSubmit}>
                <label htmlFor="name">Name:</label>
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Name" id="name" name="name"></input>

                <label htmlFor="email">Email:</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" id="email" name="email"></input>

                <label htmlFor="password">Password:</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" id="password" name="password"></input>
                <button type="submit"> Register</button>
            </form>
            <button onClick={() => props.onFormSwitch('login')}>Already have an account? Log In</button>
        </div>
    )
}