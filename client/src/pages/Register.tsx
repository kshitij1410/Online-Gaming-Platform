import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = ({ setIsLogin }: { setIsLogin: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [inputs, setInputs] = useState({
        name: "",
        email: "",
        password: "",
    });

    type CreateUser = {
        name: string;
        email: string,
        password: string,
    };
    const [err, setError] = useState(null);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axios.post<CreateUser>(
                `http://localhost:8800/api/register`,
                inputs,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );
            setIsLogin(true);

        } catch (error) {

            if (axios.isAxiosError(error)) {
                setError(error.response?.data);
            }
        }
    };

    return (
        <>
            <div className=" font-serif">

                <h1 className="mb-8 text-2xl font-medium ">Register</h1>
                <form onSubmit={handleSubmit}>
                    <label className="">Name:  </label>
                    <br></br>
                    <input
                        required
                        className="text-xl text-black border-slate-300 bg-slate-100 rounded-md my-4"
                        type="text"
                        placeholder="  Abc "
                        name="name"
                        value={inputs.name}
                        onChange={handleChange}
                    />
                    <br />
                    <label>Email:  </label>
                    <br></br>
                    <input
                        required
                        className="text-xl text-black border-slate-300 bg-slate-100 rounded-md my-4"
                        type="email"
                        placeholder="  abc@gmail.com"
                        name="email"
                        value={inputs.email}
                        onChange={handleChange}
                    />
                    <br />
                    <label>Password:  </label>
                    <br></br>
                    <input
                        required
                        type="password"
                        className="text-xl text-black border-slate-300 bg-slate-100 rounded-md my-2 "
                        placeholder="  password"
                        name="password"
                        value={inputs.password}
                        onChange={handleChange}
                    />
                    <br />
                    <button type="submit" className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-3 px-4 mt-4 border border-blue-500 hover:border-transparent rounded" >Register</button>
                    <br />

                    {err && <p>{err}</p>}
                    <span className="mt-7">
                        Do you have an account? <Link to="/" onClick={(e) => setIsLogin(true)} className="text-blue-500 hover:text-blue-300">Login</Link>
                    </span>
                </form>
            </div>
        </>
    );
};

export default Register;
