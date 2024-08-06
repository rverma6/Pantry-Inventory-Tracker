'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { firestore } from './firebase/config';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
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

  const handleItem = async (item, action, quantity = 1) => {
    //console.log('handleItem called with:', { item, action, quantity });

    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      //console.log('Existing item:', { item, existingQuantity });

      if (action === 'add') {
        await setDoc(docRef, { quantity: existingQuantity + quantity });
      } else if (action === 'remove') {
        if (existingQuantity <= quantity) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: existingQuantity - quantity });
        }
      }
    } else if (action === 'add') {
      await setDoc(docRef, { quantity: quantity });
    }
    updateInventory();
  };

  const handleUpdateItem = async () => {
    if (selectedItem) {
      //log('Updating item:', selectedItem.name, 'to new quantity:', newQuantity);
      await handleItem(selectedItem.name, 'add', newQuantity - selectedItem.quantity);
      setOpenUpdateModal(false);
      setSelectedItem(null);
      setNewQuantity(1);
    }
  };

  const filteredInventory = inventory
    .filter(item => showLowQuantity ? item.quantity === 1 : true)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 mx-auto">
          <h2 className="text-2xl mb-5">Add Item</h2>
          <div className="flex flex-col space-y-2">
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
            <TextField
              id="outlined-basic-quantity"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value)))}
              InputProps={{
                style: { color: 'white' }
              }}
              className="bg-gray-700 text-white rounded"
            />
            <Button variant="outlined" onClick={() => { handleItem(itemName, 'add', itemQuantity); setItemName(''); setItemQuantity(1); setOpenAddModal(false); }} className="bg-indigo-600 text-white hover:bg-indigo-500">
              Add
            </Button>
          </div>
        </div>
      </Modal>
      
      <Modal open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96 mx-auto">
          <h2 className="text-2xl mb-5">Update Item Quantity</h2>
          <div className="flex flex-col space-y-2">
            <Typography variant="h6" className="text-white">Item: {selectedItem?.name}</Typography>
            <TextField
              id="outlined-basic-new-quantity"
              label="New Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={newQuantity}
              onChange={(e) => setNewQuantity(Math.max(1, parseInt(e.target.value)))}
              InputProps={{
                style: { color: 'white' }
              }}
              className="bg-gray-700 text-white rounded"
            />
            <Button variant="outlined" onClick={handleUpdateItem} className="bg-indigo-600 text-white hover:bg-indigo-500">
              Update
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex space-x-2 mb-4">
        <Button variant="contained" onClick={() => setOpenAddModal(true)} className="bg-indigo-600 text-white hover:bg-indigo-500">
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
            <div key={name} className="grid grid-cols-4 gap-4 p-4 bg-gray-700 rounded shadow">
              <span className="text-lg">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
              <span className="text-lg">Quantity: {quantity}</span>
              <Button variant="contained" onClick={() => handleItem(name, 'remove')} className="bg-red-600 text-white hover:bg-red-500">
                Remove
              </Button>
              <Button variant="contained" onClick={() => { setSelectedItem({ name, quantity }); setNewQuantity(quantity); setOpenUpdateModal(true); }} className="bg-blue-600 text-white hover:bg-blue-500">
                Update
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
