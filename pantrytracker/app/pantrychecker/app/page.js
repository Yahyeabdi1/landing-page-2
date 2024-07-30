'use client';
import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "pantryapp-e8fe8",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Home() {
  const [pantry, setPantry] = useState([]); 
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewItem("");
    setError("");
  };

  const addItem = async () => {
    if (newItem.trim() !== "") {
      const existingItem = pantry.find(item => item.name === newItem);

      if (existingItem) {
        // Increment quantity if item already exists
        try {
          const q = query(collection(db, 'pantry'));
          const snapshot = await getDocs(q);
          const docToUpdate = snapshot.docs.find(doc => doc.data().name === newItem);
          if (docToUpdate) {
            await updateDoc(doc(db, 'pantry', docToUpdate.id), {
              quantity: existingItem.quantity + 1
            });
            setPantry(prevPantry =>
              prevPantry.map(item =>
                item.name === newItem ? { ...item, quantity: item.quantity + 1 } : item
              )
            );
          }
        } catch (e) {
          console.error("Error updating document: ", e);
        }
      } else {
        // Add new item
        try {
          const docRef = await addDoc(collection(db, 'pantry'), { name: newItem, quantity: 1 });
          setPantry((prevPantry) => [...prevPantry, { name: newItem, quantity: 1 }]);
          setNewItem("");
          handleClose();
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }
    }
  };

  const removeItem = async (itemName) => {
    try {
      const q = query(collection(db, 'pantry'));
      const snapshot = await getDocs(q);
      const docToDelete = snapshot.docs.find(doc => doc.data().name === itemName);
      if (docToDelete) {
        await deleteDoc(doc(db, 'pantry', docToDelete.id));
        setPantry((prevPantry) => prevPantry.filter(item => item.name !== itemName));
      }
    } catch (e) {
      console.error("Error removing document: ", e);
    }
  };

  useEffect(() => {
    const updatePantry = async () => {
      const q = query(collection(db, 'pantry'));
      const snapshot = await getDocs(q);
      const pantryList = [];

      snapshot.docs.forEach((doc) => {
        const { name, quantity } = doc.data();
        pantryList.push({ name, quantity });
      });
      setPantry(pantryList);
    };
    updatePantry();
  }, []);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      border="3px solid #333"
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add a new item
          </Typography>
          <TextField
            value={newItem}
            onChange={(e) => {
              setNewItem(e.target.value);
              setError("");
            }}
            label="Item Name"
            fullWidth
            margin="normal"
            error={!!error}
            helperText={error}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={addItem}
          >
            Add Item
          </Button>
        </Box>
      </Modal>
      <Box
        width="100%"
        maxWidth="800px"
        bgcolor="#ADD8E6"
        p={2}
        borderTop="2px solid #333"
        borderLeft="2px solid #333"
        borderRight="2px solid #333"
        borderTopLeftRadius="8px"
        borderTopRightRadius="8px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
          <Typography
            variant="h2"
            color="black"
            textAlign="center"
          >
            Pantry Items
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
        >
          Add Item
        </Button>
      </Box>
      <Box
        width="100%"
        maxWidth="800px"
        height="calc(100% - 80px)"
        overflow="hidden"
        border="2px solid #333"
        borderRadius="0 0 8px 8px"
        display="flex"
        flexDirection="column"
      >
        <Stack
          width="100%"
          height="100%"
          spacing={2}
          overflow="auto"
        >
          {pantry.length === 0 ? (
            <Typography variant="h5" color="#333" textAlign="center">
              No items in the pantry.
            </Typography>
          ) : (
            pantry.map((item, index) => (
              <Box
                key={index}
                sx={{
                  width: '100%',
                  flex: 1,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#f0f0f0',
                  borderBottom: index < pantry.length - 1 ? '1px solid #333' : 'none',
                  borderRadius: '0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="h5"
                  color="#333"
                  textAlign="center"
                  fontWeight="bold"
                  sx={{ marginBottom: '10px' }}
                >
                  {item.name && typeof item.name === 'string'
                    ? `${item.name.charAt(0).toUpperCase() + item.name.slice(1)} (x${item.quantity})`
                    : ''}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => removeItem(item.name)}
                >
                  Remove Item
                </Button>
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
}