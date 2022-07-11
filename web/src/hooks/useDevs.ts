import { useContext } from "react";
import { DevsContext } from "../contexts/DevsContext"; 

export function useDevs() {
    return useContext(DevsContext)
}