import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendRequest } from "../Helper/BackendReques";

export interface LoginCheckerProps {
    children: ReactNode,
    allowedUser: 'logged-in' | 'not-logged-in'
}

export function LoginChecker({ children, allowedUser }: LoginCheckerProps) {
    const [allowed, setAllowed] = useState(false);
    // const [checked, setChecked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkTokenValidity = async () => {
            // if (checked) return; 
            
            const token = localStorage.getItem('token');

            if (allowedUser === 'logged-in') {
                if (token) {
                    try {
                        const validationResponse = await backendRequest('GET', '/validate-token'); 
                        if (validationResponse.success) {
                            setAllowed(true);
                        } else {
                            localStorage.clear();
                            navigate("/login");
                        }
                    } catch (error) {
                        console.error("Token validation failed:", error);
                        navigate("/login");
                    }
                } else {
                    navigate("/login");
                }
            } else if (allowedUser === 'not-logged-in') {
                if (!token) {
                    setAllowed(true);
                } else {
                    navigate("/");
                }
            }
            // setChecked(true); // Ensure it only runs once
        };

        checkTokenValidity();
    }, [allowedUser, navigate]);

    if (allowed) return children;
    return null; // Optionally, render a loading spinner or message here
}