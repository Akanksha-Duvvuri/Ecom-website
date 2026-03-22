import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => { //loads wishlist on authentication
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setWishlist([]); setUserId(null); return; }
      setUserId(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setWishlist(snap.data().wishlist || []);
      }
    });
    return () => unsub();
  }, []);

  const toggle = async (productId: string) => {
    if (!userId) return;
    const ref = doc(db, "users", userId);
    const isWishlisted = wishlist.includes(productId); //already there
    if (isWishlisted) { 
      await updateDoc(ref, { wishlist: arrayRemove(productId) }); //removing
      setWishlist(prev => prev.filter(id => id !== productId));  //filters it out
    } else {
      await updateDoc(ref, { wishlist: arrayUnion(productId) }); //array union is a firestore helper that adds a value to an array only if it doesnt already exist
      setWishlist(prev => [...prev, productId]);
    }
  };

  return { wishlist, toggle };
}