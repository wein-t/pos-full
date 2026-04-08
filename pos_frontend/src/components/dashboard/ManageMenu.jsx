import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// NOTE: You will need to add updateItemPrice to your https.js file (see Step 2)
import { getMenus, addCategory, deleteCategory, addItemToCategory, deleteItemFromCategory, updateItemPrice } from '../../https';
import { enqueueSnackbar } from 'notistack';
import Modal from '../shared/Modal'; 
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa'; // Added FaEdit

const ManageMenu = () => {
    const queryClient = useQueryClient();
    
    // Modal States
    const [isCatModalOpen, setCatModalOpen] = useState(false);
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false); // New Edit Modal State
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    // Form States
    const [catForm, setCatForm] = useState({ name: "", icon: "🍽️", bgColor: "#285430" });
    const [itemForm, setItemForm] = useState({ name: "", price: "" });
    const [editForm, setEditForm] = useState({ categoryId: null, itemId: null, name: "", price: "" }); // Form for editing

    // 1. FETCH DATA
    const { data: menuData, isLoading } = useQuery({
        queryKey: ['menus'],
        queryFn: getMenus
    });

    const menus = menuData?.data?.data || [];

    // 2. MUTATIONS
    const createCategoryMutation = useMutation({
        mutationFn: addCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['menus']);
            enqueueSnackbar("Category created!", { variant: "success" });
            setCatModalOpen(false);
            setCatForm({ name: "", icon: "🍽️", bgColor: "#285430" });
        },
        onError: (err) => enqueueSnackbar(err.response?.data?.message || "Failed to create category", { variant: "error" })
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['menus']);
            enqueueSnackbar("Category deleted!", { variant: "success" });
        }
    });

    const addItemMutation = useMutation({
        mutationFn: addItemToCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['menus']);
            enqueueSnackbar("Dish added!", { variant: "success" });
            setItemModalOpen(false);
            setItemForm({ name: "", price: "" });
        },
        onError: (err) => enqueueSnackbar(err.response?.data?.message || "Failed to add dish", { variant: "error" })
    });

    const deleteItemMutation = useMutation({
        mutationFn: deleteItemFromCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['menus']);
            enqueueSnackbar("Dish removed!", { variant: "success" });
        }
    });

    // NEW MUTATION: Edit Item Price
    const editItemMutation = useMutation({
        mutationFn: updateItemPrice,
        onSuccess: () => {
            queryClient.invalidateQueries(['menus']);
            enqueueSnackbar("Price updated successfully!", { variant: "success" });
            setEditModalOpen(false);
            setEditForm({ categoryId: null, itemId: null, name: "", price: "" });
        },
        onError: (err) => enqueueSnackbar(err.response?.data?.message || "Failed to update price", { variant: "error" })
    });

    // Handlers
    const handleAddCategory = () => createCategoryMutation.mutate(catForm);
    
    const handleAddItem = () => {
        addItemMutation.mutate({ 
            categoryId: selectedCategoryId, 
            name: itemForm.name, 
            price: Number(itemForm.price) 
        });
    };

    const openItemModal = (catId) => {
        setSelectedCategoryId(catId);
        setItemModalOpen(true);
    };

    // Open Edit Modal and prepopulate data
    const openEditModal = (categoryId, item) => {
        setEditForm({
            categoryId: categoryId,
            itemId: item._id,
            name: item.name,
            price: item.price
        });
        setEditModalOpen(true);
    };

    const handleEditPrice = () => {
        editItemMutation.mutate({
            categoryId: editForm.categoryId,
            itemId: editForm.itemId,
            price: Number(editForm.price)
        });
    };

    if (isLoading) return <div className="text-white p-4">Loading Menu...</div>;

    return (
        <div className="h-full overflow-y-auto pb-20 p-4">
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#f5f5f5]">Menu Management</h2>
                <button 
                    onClick={() => setCatModalOpen(true)}
                    className="bg-[#f6b100] hover:bg-yellow-600 text-[#1a1a1a] font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                    <FaPlus /> Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menus.map((category) => (
                    <div key={category._id} className="bg-[#262626] rounded-xl overflow-hidden shadow-lg border border-[#333]">
                        {/* Category Header */}
                        <div className="p-4 flex justify-between items-center" style={{ backgroundColor: category.bgColor }}>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{category.icon}</span>
                                <h3 className="text-white font-bold text-lg">{category.name}</h3>
                            </div>
                            <button 
                                onClick={() => {
                                    if(window.confirm("Delete this category and all its items?")) {
                                        deleteCategoryMutation.mutate(category._id);
                                    }
                                }}
                                className="text-white/70 hover:text-red-500 transition-colors p-2 cursor-pointer"
                            >
                                <FaTrash />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scroll">
                            {category.items.length === 0 ? (
                                <p className="text-gray-500 text-center text-sm italic">No items yet.</p>
                            ) : (
                                category.items.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-lg group hover:bg-[#333] transition-colors">
                                        <div>
                                            <p className="text-gray-200 font-medium">{item.name}</p>
                                            <p className="text-[#f6b100] text-sm font-bold">₱{item.price}</p>
                                        </div>
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => openEditModal(category._id, item)}
                                                className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                                                title="Edit Price"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteItemMutation.mutate({ categoryId: category._id, itemId: item._id })}
                                                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                title="Delete Dish"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Item Button */}
                        <div className="p-4 border-t border-[#333]">
                            <button 
                                onClick={() => openItemModal(category._id)}
                                className="w-full py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-[#f6b100] hover:text-[#f6b100] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <FaPlus size={12} /> Add Dish
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- MODAL: ADD CATEGORY --- */}
            <Modal isOpen={isCatModalOpen} onClose={() => setCatModalOpen(false)} title="New Menu Category">
                <div className="space-y-4">
                    <div>
                        <label className="text-[#ababab] text-sm">Category Name</label>
                        <input 
                            className="w-full bg-[#262626] text-white p-3 rounded-lg outline-none focus:border-[#f6b100] border border-transparent"
                            placeholder="e.g. Rice Bowls"
                            value={catForm.name}
                            onChange={e => setCatForm({...catForm, name: e.target.value})}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[#ababab] text-sm">Icon (Emoji)</label>
                            <input 
                                className="w-full bg-[#262626] text-white p-3 rounded-lg outline-none"
                                placeholder="e.g. 🍛"
                                value={catForm.icon}
                                onChange={e => setCatForm({...catForm, icon: e.target.value})}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[#ababab] text-sm">Color</label>
                            <input 
                                type="color"
                                className="w-full h-[50px] bg-transparent cursor-pointer"
                                value={catForm.bgColor}
                                onChange={e => setCatForm({...catForm, bgColor: e.target.value})}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleAddCategory}
                        className="w-full bg-[#f6b100] text-black font-bold py-3 rounded-lg mt-4 hover:bg-yellow-600 cursor-pointer"
                    >
                        Create Category
                    </button>
                </div>
            </Modal>

            {/* --- MODAL: ADD ITEM --- */}
            <Modal isOpen={isItemModalOpen} onClose={() => setItemModalOpen(false)} title="Add Dish">
                <div className="space-y-4">
                    <div>
                        <label className="text-[#ababab] text-sm">Dish Name</label>
                        <input 
                            className="w-full bg-[#262626] text-white p-3 rounded-lg outline-none focus:border-[#f6b100] border border-transparent"
                            placeholder="e.g. Spicy Chicken"
                            value={itemForm.name}
                            onChange={e => setItemForm({...itemForm, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[#ababab] text-sm">Price (₱)</label>
                        <input 
                            type="number"
                            className="w-full bg-[#262626] text-white p-3 rounded-lg outline-none focus:border-[#f6b100] border border-transparent"
                            placeholder="0.00"
                            value={itemForm.price}
                            onChange={e => setItemForm({...itemForm, price: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleAddItem}
                        className="w-full bg-[#f6b100] text-black font-bold py-3 rounded-lg mt-4 hover:bg-yellow-600 cursor-pointer"
                    >
                        Add Dish
                    </button>
                </div>
            </Modal>

            {/* --- MODAL: EDIT ITEM PRICE --- */}
            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Price: ${editForm.name}`}>
                <div className="space-y-4">
                    <div>
                        <label className="text-[#ababab] text-sm">New Price (₱)</label>
                        <input 
                            type="number"
                            className="w-full bg-[#262626] text-white p-3 rounded-lg outline-none focus:border-[#f6b100] border border-transparent"
                            placeholder="0.00"
                            value={editForm.price}
                            onChange={e => setEditForm({...editForm, price: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleEditPrice}
                        className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-600 cursor-pointer"
                    >
                        Save Price
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ManageMenu;