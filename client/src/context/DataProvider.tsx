import { createContext, useState, ReactNode } from "react";

interface UserDataInterface {
    email: string,
    user_id: number
}
interface DataContextInterface {
    account: UserDataInterface | null | undefined;
    setAccount: React.Dispatch<React.SetStateAction<{
        email: string;
        user_id: number;
    }>>
}

export const DataContext = createContext<DataContextInterface | null>(null);

interface props {
    children: ReactNode
}

const DataProvider = ({ children }: props) => {
    const [account, setAccount] = useState({ email: '', user_id: 0 });

    return (
        <DataContext.Provider value={{
            account,
            setAccount
        }}>
            {children}
        </DataContext.Provider>
    )
}

export default DataProvider;