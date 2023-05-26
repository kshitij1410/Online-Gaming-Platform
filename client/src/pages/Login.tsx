import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ isUserAuthenticated,setIsLogin }: { isUserAuthenticated: React.Dispatch<React.SetStateAction<boolean>>, setIsLogin:React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    });
    const [err, setError] = useState(null);

    const navigate = useNavigate();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {

            const res = await axios.post(`http://localhost:8800/api/login`, inputs);
            localStorage.setItem('userData', JSON.stringify(res.data));
            isUserAuthenticated(true);
            navigate("/home");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data);
            }
        }
    };



    return (
        <>
            <div className=" font-serif">

                <h1 className="mb-8 text-2xl font-medium ">Login</h1>
                
                <form onSubmit={handleSubmit}>
                    <label>Email:  </label>
                    <br></br>
                    <input
                        required
                        className="text-xl text-black border-slate-300 bg-slate-100 rounded-md my-4"
                        type="email"
                        placeholder="  abc@gmail.com"
                        name="email"
                        onChange={handleChange}
                    />
                    <br />
                    <label>Password:</label>
                    <br></br>
                    <input
                        required
                        type="password"
                        className="text-xl text-black border-slate-300 bg-slate-100 rounded-md my-2 "
                        placeholder="  password"
                        name="password"
                        onChange={handleChange}
                    />
                    <br />
                    <button type="submit"  className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-3 px-4 mt-4 border border-blue-500 hover:border-transparent rounded">Login</button>
                    <br />
                    {err && <p>{err}</p>}
                    <span className="mt-9">
                        Do you have an account? <Link to="/" onClick={(e)=>setIsLogin(false)} className="text-blue-500 hover:text-blue-300">Register</Link>
                    </span>
                </form>
            </div>
        </>

    );
};

export default Login;
