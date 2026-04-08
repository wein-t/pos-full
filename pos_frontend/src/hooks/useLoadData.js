import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice";

const useLoadData = () => {
    const dispatch = useDispatch();
    // This hook now only runs once when the app starts.
    // It's much faster and doesn't make an API call.
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserFromStorage = () => {
            try {
                // 1. Try to get the user info string from localStorage
                const userInfoString = localStorage.getItem('userInfo');

                // 2. If it exists, parse it and dispatch it to Redux
                if (userInfoString) {
                    const userInfo = JSON.parse(userInfoString);

                    // We dispatch the 'data' part of the stored object, which contains the user details
                    if (userInfo && userInfo.data) {
                        dispatch(setUser(userInfo.data));
                    }
                }
            } catch (error) {
                console.error("Failed to load user data from storage:", error);
            } finally {
                // 3. Set loading to false regardless of success or failure
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
        
    }, [dispatch]); // The dependency array now only contains 'dispatch'
    
    return isLoading;
};

export default useLoadData;