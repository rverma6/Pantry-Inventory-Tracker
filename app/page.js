'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { firestore } from './firebase/config';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowQuantity, setShowLowQuantity] = useState(false);
  const [sortOption, setSortOption] = useState('alphabetical');

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(query(collection(firestore, 'inventory')));
      const inventoryList = snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
      setInventory(sortInventory(inventoryList));
    };
    fetchData();
  }, [sortOption]);

  const sortInventory = (inventoryList) => {
    return inventoryList.sort((a, b) => sortOption === 'alphabetical'
      ? a.name.localeCompare(b.name)
      : a.quantity - b.quantity || a.name.localeCompare(b.name));
  };

  const updateInventory = async () => {
    const snapshot = await getDocs(query(collection(firestore, 'inventory')));
    const inventoryList = snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    setInventory(sortInventory(inventoryList));
  };

  const handleItem = async (item, action) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (action === 'add') {
        await setDoc(docRef, { quantity: quantity + 1 });
      } else if (action === 'remove') {
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
    } else if (action === 'add') {
      await setDoc(docRef, { quantity: 1 });
    }
    updateInventory();
  };

  const filteredInventory = inventory
    .filter(item => showLowQuantity ? item.quantity === 1 : true)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <Modal open={open} onClose={() => setOpen(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 mx-auto">
          <h2 className="text-2xl mb-5">Add Item</h2>
          <div className="flex space-x-2">
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              InputProps={{
                style: { color: 'white' }
              }}
              className="bg-gray-700 text-white rounded"
            />
            <Button variant="outlined" onClick={() => { handleItem(itemName, 'add'); setItemName(''); setOpen(false); }} className="bg-indigo-600 text-white hover:bg-indigo-500">
              Add
            </Button>
          </div>
        </div>
      </Modal>
      <div className="flex space-x-2 mb-4">
        <Button variant="contained" onClick={() => setOpen(true)} className="bg-indigo-600 text-white hover:bg-indigo-500">
          Add New Item
        </Button>
        <Button variant="contained" onClick={() => setShowLowQuantity(!showLowQuantity)} className="bg-indigo-600 text-white hover:bg-indigo-500">
          {showLowQuantity ? 'Show All Items' : 'Show Low Quantity Items'}
        </Button>
        <FormControl variant="outlined" className="rounded bg-indigo-600">
          <InputLabel className="text-white">Sort Options</InputLabel>
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            label="Sort Options"
            className="bg-indigo-600 text-white"
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#5a67d8',
                  '& .MuiMenuItem-root': {
                    color: 'white',
                  },
                },
              },
            }}
          >
            <MenuItem value="alphabetical">Sort Alphabetically</MenuItem>
            <MenuItem value="quantity">Sort by Quantity</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="search-bar"
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            style: { color: 'white' }
          }}
          className="bg-gray-700 text-white rounded"
        />
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="bg-gray-700 p-4 rounded-t-lg">
          <h2 className="text-center text-xl">Inventory Items</h2>
        </div>
        <div className="space-y-2 p-2 max-h-96 overflow-auto">
          {filteredInventory.map(({ name, quantity }) => (
            <div key={name} className="grid grid-cols-3 gap-4 p-4 bg-gray-700 rounded shadow">
              <span className="text-lg">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
              <span className="text-lg">Quantity: {quantity}</span>
              <Button variant="contained" onClick={() => handleItem(name, 'remove')} className="bg-red-600 text-white hover:bg-red-500">
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
