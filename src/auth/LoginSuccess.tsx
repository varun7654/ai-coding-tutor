import {useLocation, useSearchParams} from "react-router-dom";
import {AUTH_API_URL} from "../App";
import {useEffect} from "react";

export default function LoginSuccess({token, setToken} : {token: string | undefined, setToken: (token: string) => void}){
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    useEffect(() => {
        let code = searchParams.get("code");
        setSearchParams({});
        if (code) {
            fetch(AUTH_API_URL, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "user-agent": "cloudflare-worker-ai-tutor-login",
                    accept: "application/json",
                },
                body: JSON.stringify({code})
            })
            .then(response => response.json())
                .then(result => {
                    if (result.token) {
                        setToken(result.token);
                        console.log("Finished logging in. Token: " + result.token);
                        localStorage.setItem("token", result.token);
                        window.location.href = "/auth/login";
                    } else {
                        console.error(result);
                    }

                })
                .catch(error => {
                    console.error(error);
                });
        }
    }, []);

    
    if (token) {
        return (
            <div>
                <h1>Logging in...</h1>
            </div>
        )
    } else {
        return (
            <div>
                <h1>Something went wrong logging in (no code was sent)</h1>
            </div>
        )
    }

    
}