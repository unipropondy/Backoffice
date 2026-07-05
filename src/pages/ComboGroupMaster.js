import { API_BASE_URL } from "../config/config";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./ComboGroupMaster.css";

function ComboGroupMaster({ sidebarOpen }) {
  // State for combo groups
  const [comboGroups, setComboGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // State for dish mapping
  const [dishMappings, setDishMappings] = useState([]);
  const [showDishModal, setShowDishModal] = useState(false);
  const [editMappingId, setEditMappingId] = useState(null);
  
  // State for parent combo dishes
  const [parentDishes, setParentDishes] = useState([]);
  const [availableDishes, setAvailableDishes] = useState([]);
  const [selectedParentDish, setSelectedParentDish] = useState(null);

  // Search states for dropdowns
  const [parentDishSearch, setParentDishSearch] = useState("");
  const [dishSearch, setDishSearch] = useState("");
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [showDishDropdown, setShowDishDropdown] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('groups');

  // Form state for Combo Group
  const [form, setForm] = useState({
    ParentComboDishId: "",
    GroupName: "",
    DisplayOrder: 0,
    MinSelection: 1,
    MaxSelection: 1,
    IsMultiSelect: false,
    IsActive: true
  });

  // Form state for Dish Mapping
  const [dishForm, setDishForm] = useState({
    ComboGroupId: "",
    DishId: "",
    Surcharge: 0.00,
    IsDefault: false,
    SortOrder: 0,
    IsActive: true
  });

  // ================= FETCH DATA =================
  const fetchParentDishes = useCallback(async () => {
    try {
      const res = await axios.get(API_BASE_URL + "/api/combo/parent-dishes");
      console.log("PARENT DISHES => ", res.data);
      setParentDishes(res.data);
    } catch (err) {
      console.error("Fetch Parent Dishes Error:", err);
    }
  }, []);

  const fetchAvailableDishes = useCallback(async () => {
    try {
      const res = await axios.get(API_BASE_URL + "/api/combo/available-dishes");
      setAvailableDishes(res.data);
    } catch (err) {
      console.error("Fetch Available Dishes Error:", err);
    }
  }, []);

  const fetchComboGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE_URL + "/api/combo/groups");
      setComboGroups(res.data);
    } catch (err) {
      console.error("Fetch Combo Groups Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDishMappings = useCallback(async (groupId = null) => {
    try {
      const url = groupId 
        ? `${API_BASE_URL}/api/combo/mappings/${groupId}`
        : `${API_BASE_URL}/api/combo/mappings`;
      const res = await axios.get(url);
      setDishMappings(res.data);
    } catch (err) {
      console.error("Fetch Dish Mappings Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchParentDishes();
    fetchAvailableDishes();
    fetchComboGroups();
  }, [fetchParentDishes, fetchAvailableDishes, fetchComboGroups]);

  // ================= HANDLE COMBO GROUP INPUT =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ================= HANDLE DISH MAPPING INPUT =================
  const handleDishChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDishForm({
      ...dishForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ================= OPEN COMBO GROUP MODAL =================
  const openModal = (item = null) => {
    if (item) {
      setEditId(item.ComboGroupId);
      setForm({
        ParentComboDishId: item.ParentComboDishId || "",
        GroupName: item.GroupName || "",
        DisplayOrder: item.DisplayOrder || 0,
        MinSelection: item.MinSelection || 1,
        MaxSelection: item.MaxSelection || 1,
        IsMultiSelect: item.IsMultiSelect === true || item.IsMultiSelect === 1,
        IsActive: item.IsActive === true || item.IsActive === 1
      });
      // Set search value for parent dish
      const parentDish = parentDishes.find(p => p.DishId === item.ParentComboDishId);
      if (parentDish) {
        setParentDishSearch(`${parentDish.DishCode} - ${parentDish.Name}`);
      }
    } else {
      setEditId(null);
      setForm({
        ParentComboDishId: "",
        GroupName: "",
        DisplayOrder: 0,
        MinSelection: 1,
        MaxSelection: 1,
        IsMultiSelect: false,
        IsActive: true
      });
      setParentDishSearch("");
    }
    setShowModal(true);
    setShowParentDropdown(false);
  };

  // ================= OPEN DISH MAPPING MODAL =================
  const openDishModal = (groupId = null, mapping = null) => {
    if (mapping) {
      setEditMappingId(mapping.MappingId);
      setDishForm({
        ComboGroupId: mapping.ComboGroupId,
        DishId: mapping.DishId,
        Surcharge: mapping.Surcharge || 0.00,
        IsDefault: mapping.IsDefault === true || mapping.IsDefault === 1,
        SortOrder: mapping.SortOrder || 0,
        IsActive: mapping.IsActive === true || mapping.IsActive === 1
      });
      // Set search value for dish
      const dish = availableDishes.find(d => d.DishId === mapping.DishId);
      if (dish) {
        setDishSearch(`${dish.DishCode} - ${dish.Name}`);
      }
    } else {
      setEditMappingId(null);
      setDishForm({
        ComboGroupId: groupId || "",
        DishId: "",
        Surcharge: 0.00,
        IsDefault: false,
        SortOrder: 0,
        IsActive: true
      });
      setDishSearch("");
    }
    setShowDishModal(true);
    setShowDishDropdown(false);
  };

  // ================= SAVE COMBO GROUP =================
  const handleSave = async () => {
    if (!form.GroupName.trim()) {
      alert("Please enter a group name.");
      return;
    }
    if (!form.ParentComboDishId) {
      alert("Please select a parent combo dish.");
      return;
    }
    if (parseInt(form.MinSelection) > parseInt(form.MaxSelection)) {
      alert("Min selection cannot be greater than Max selection.");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/combo/groups/${editId}`, form);
      } else {
        await axios.post(API_BASE_URL + "/api/combo/groups", form);
      }
      setShowModal(false);
      fetchComboGroups();
    } catch (err) {
      console.error("Save Combo Group Error:", err);
      alert("Failed to save combo group.");
    }
  };

  // ================= SAVE DISH MAPPING =================
  const handleSaveDish = async () => {
    if (!dishForm.ComboGroupId) {
      alert("Please select a combo group.");
      return;
    }
    if (!dishForm.DishId) {
      alert("Please select a dish.");
      return;
    }

    try {
      if (editMappingId) {
        await axios.put(`${API_BASE_URL}/api/combo/mappings/${editMappingId}`, dishForm);
      } else {
        await axios.post(API_BASE_URL + "/api/combo/mappings", dishForm);
      }
      setShowDishModal(false);
      fetchDishMappings(dishForm.ComboGroupId);
      setActiveTab('mappings');
    } catch (err) {
  console.error("Save Dish Mapping Error:", err);

  console.log("Response =>", err.response);
  console.log("Data =>", err.response?.data);

  alert(JSON.stringify(err.response?.data));
}
  };

  // ================= DELETE COMBO GROUP =================
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this combo group and its mappings?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/combo/groups/${id}`);
        fetchComboGroups();
      } catch (err) {
        console.error("Delete Combo Group Error:", err);
        alert("Failed to delete combo group.");
      }
    }
  };

  // ================= DELETE DISH MAPPING =================
  const handleDeleteDish = async (id) => {
    if (window.confirm("Are you sure you want to remove this dish from the combo group?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/combo/mappings/${id}`);
        setShowDishModal(false);
        fetchDishMappings(dishForm.ComboGroupId);
      } catch (err) {
        console.error("Delete Dish Mapping Error:", err);
        alert("Failed to delete dish mapping.");
      }
    }
  };

  // ================= VIEW GROUP DETAILS (show dish mappings) =================
  const viewGroupDetails = async (groupId) => {
    await fetchDishMappings(groupId);
    setSelectedParentDish(groupId);
    setActiveTab('mappings');
  };

  // ================= ROW CLICK HANDLERS =================
  const handleGroupRowClick = (item) => {
    openModal(item);
  };

  const handleMappingRowClick = (mapping) => {
    openDishModal(null, mapping);
  };

  // ================= FILTER FUNCTIONS =================
  const getFilteredParentDishes = () => {
    if (!parentDishSearch.trim()) return parentDishes;
    const searchLower = parentDishSearch.toLowerCase();
    return parentDishes.filter(dish => 
      dish.DishCode?.toLowerCase().includes(searchLower) ||
      dish.Name?.toLowerCase().includes(searchLower)
    );
  };

  const getFilteredDishes = () => {
    if (!dishSearch.trim()) return availableDishes;
    const searchLower = dishSearch.toLowerCase();
    return availableDishes.filter(dish => 
      dish.DishCode?.toLowerCase().includes(searchLower) ||
      dish.Name?.toLowerCase().includes(searchLower)
    );
  };

  // ================= HANDLE PARENT DISH SELECT =================
  const handleParentDishSelect = (dish) => {
    setForm({ ...form, ParentComboDishId: dish.DishId });
    setParentDishSearch(`${dish.DishCode} - ${dish.Name}`);
    setShowParentDropdown(false);
  };

  // ================= HANDLE DISH SELECT =================
  const handleDishSelect = (dish) => {
    setDishForm({ ...dishForm, DishId: dish.DishId });
    setDishSearch(`${dish.DishCode} - ${dish.Name}`);
    setShowDishDropdown(false);
  };

  return (
    <div className={`combogroupmaster-page ${sidebarOpen ? "combogroupmaster-sidebar-open" : ""}`}>
      <div className="combogroupmaster-container">
        {/* HEADER AREA */}
        <div className="combogroupmaster-top-header">
          <h1 className="combogroupmaster-page-title">Combo Group Master</h1>
          <div className="combogroupmaster-header-buttons">
            <button className="combogroupmaster-btn-orange-new" onClick={() => openModal()}>
              New Group
            </button>
            <button 
              className="combogroupmaster-btn-orange-new" 
              onClick={() => openDishModal()}
            >
              Add Dish Mapping
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="combogroupmaster-tabs">
          <button 
            className={`combogroupmaster-tab ${activeTab === 'groups' ? 'combogroupmaster-tab-active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Combo Groups
          </button>
          <button 
            className={`combogroupmaster-tab ${activeTab === 'mappings' ? 'combogroupmaster-tab-active' : ''}`}
            onClick={() => {
              setActiveTab('mappings');
              if (selectedParentDish) {
                fetchDishMappings(selectedParentDish);
              } else {
                fetchDishMappings();
              }
            }}
          >
            Dish Mappings
          </button>
        </div>

        {/* TAB 1: COMBO GROUPS */}
        {activeTab === 'groups' && (
          <div className="combogroupmaster-tab-content">
            <div className="combogroupmaster-table-card">
              <table className="combogroupmaster-custom-table">
                <thead>
                  <tr>
                    <th className="combogroupmaster-text-center">Group Name</th>
                    <th className="combogroupmaster-text-center">Parent Dish</th>
                    <th className="combogroupmaster-text-center">Min</th>
                    <th className="combogroupmaster-text-center">Max</th>
                    <th className="combogroupmaster-text-center">Multi Select</th>
                    <th className="combogroupmaster-text-center">Display Order</th>
                    <th className="combogroupmaster-text-center">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="combogroupmaster-text-center">Loading...</td>
                    </tr>
                  ) : comboGroups.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="combogroupmaster-text-center">No combo groups found.</td>
                    </tr>
                  ) : (
                    comboGroups.map((item) => {
                      const parentDish = parentDishes.find(p => p.DishId === item.ParentComboDishId);
                      return (
                        <tr 
                          key={item.ComboGroupId}
                          className="combogroupmaster-clickable-row"
                          onClick={() => handleGroupRowClick(item)}
                          title="Click to edit group"
                        >
                          <td className="combogroupmaster-text-center">{item.GroupName}</td>
                          <td className="combogroupmaster-text-center">
                            {item.ParentDishName || 'N/A'}
                          </td>
                          <td className="combogroupmaster-text-center">{item.MinSelection}</td>
                          <td className="combogroupmaster-text-center">{item.MaxSelection}</td>
                          <td className="combogroupmaster-text-center">
                            <input
                              type="checkbox"
                              className="combogroupmaster-custom-checkbox"
                              checked={item.IsMultiSelect}
                              readOnly
                            />
                          </td>
                          <td className="combogroupmaster-text-center">{item.DisplayOrder}</td>
                          <td className="combogroupmaster-text-center">
                            <input
                              type="checkbox"
                              className="combogroupmaster-custom-checkbox"
                              checked={item.IsActive}
                              readOnly
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="combogroupmaster-hint">
              
            </div>
          </div>
        )}

        {/* TAB 2: DISH MAPPINGS */}
        {activeTab === 'mappings' && (
          <div className="combogroupmaster-tab-content">
            {selectedParentDish && (
              <div className="combogroupmaster-group-info">
                <span className="combogroupmaster-group-label">Selected Group: </span>
                <span className="combogroupmaster-group-name">
                  {comboGroups.find(g => g.ComboGroupId === selectedParentDish)?.GroupName || 'N/A'}
                </span>
                <button 
                  className="combogroupmaster-btn-clear-group"
                  onClick={() => {
                    setSelectedParentDish(null);
                    setDishMappings([]);
                  }}
                >
                  Clear Selection
                </button>
              </div>
            )}
            
            <div className="combogroupmaster-table-card">
              <table className="combogroupmaster-custom-table">
                <thead>
                  <tr>
                    <th className="combogroupmaster-text-center">Dish Name</th>
                    <th className="combogroupmaster-text-center">Surcharge</th>
                    <th className="combogroupmaster-text-center">Is Default</th>
                    <th className="combogroupmaster-text-center">Sort Order</th>
                    <th className="combogroupmaster-text-center">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {dishMappings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="combogroupmaster-text-center">
                        {selectedParentDish ? 'No dish mappings found for this group.' : 'Select a group to view dish mappings.'}
                      </td>
                    </tr>
                  ) : (
                    dishMappings.map((mapping) => {
                      const dish = availableDishes.find(d => d.DishId === mapping.DishId);
                      return (
                        <tr 
                          key={mapping.MappingId}
                          className="combogroupmaster-clickable-row"
                          onClick={() => handleMappingRowClick(mapping)}
                          title="Click to edit mapping"
                        >
                          <td className="combogroupmaster-text-center">
                            {dish ? dish.Name : 'N/A'}
                          </td>
                          <td className="combogroupmaster-text-center">
                            ${mapping.Surcharge.toFixed(2)}
                          </td>
                          <td className="combogroupmaster-text-center">
                            <input
                              type="checkbox"
                              className="combogroupmaster-custom-checkbox"
                              checked={mapping.IsDefault}
                              readOnly
                            />
                          </td>
                          <td className="combogroupmaster-text-center">{mapping.SortOrder}</td>
                          <td className="combogroupmaster-text-center">
                            <input
                              type="checkbox"
                              className="combogroupmaster-custom-checkbox"
                              checked={mapping.IsActive}
                              readOnly
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="combogroupmaster-hint">
              
            </div>
          </div>
        )}
      </div>

      {/* COMBO GROUP MODAL */}
      {showModal && (
        <div className="combogroupmaster-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="combogroupmaster-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="combogroupmaster-modal-header">
              <h2>{editId ? "Edit Combo Group" : "New Combo Group"}</h2>
            </div>

            <div className="combogroupmaster-form-field">
              <label>Group Name *</label>
              <input
                type="text"
                name="GroupName"
                placeholder="Enter group name"
                value={form.GroupName}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div className="combogroupmaster-form-field">
              <label>Parent Combo Dish *</label>
              <div className="combogroupmaster-search-dropdown">
                <input
                  type="text"
                  placeholder="Search Parent Dish..."
                  value={parentDishSearch}
                  onChange={(e) => {
                    setParentDishSearch(e.target.value);
                    setShowParentDropdown(true);
                    if (!e.target.value) {
                      setForm({ ...form, ParentComboDishId: "" });
                    }
                  }}
                  onFocus={() => setShowParentDropdown(true)}
                  onBlur={() => {
                    // Delay to allow click on dropdown items
                    setTimeout(() => setShowParentDropdown(false), 200);
                  }}
                  className="combogroupmaster-search-input"
                />
                {showParentDropdown && (
                  <div className="combogroupmaster-dropdown-list">
                    {getFilteredParentDishes().length === 0 ? (
                      <div className="combogroupmaster-dropdown-item no-results">
                        No parent dishes found
                      </div>
                    ) : (
                      getFilteredParentDishes().map(dish => (
                        <div
                          key={dish.DishId}
                          className={`combogroupmaster-dropdown-item ${
                            form.ParentComboDishId === dish.DishId ? 'selected' : ''
                          }`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleParentDishSelect(dish)}
                        >
                          {dish.DishCode} - {dish.Name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="combogroupmaster-form-row">
              <div className="combogroupmaster-form-field half">
                <label>Min Selection</label>
                <input
                  type="number"
                  name="MinSelection"
                  min="0"
                  value={form.MinSelection}
                  onChange={handleChange}
                />
              </div>
              <div className="combogroupmaster-form-field half">
                <label>Max Selection</label>
                <input
                  type="number"
                  name="MaxSelection"
                  min="0"
                  value={form.MaxSelection}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="combogroupmaster-form-row">
              <div className="combogroupmaster-form-field half">
                <label>Display Order</label>
                <input
                  type="number"
                  name="DisplayOrder"
                  min="0"
                  value={form.DisplayOrder}
                  onChange={handleChange}
                />
              </div>
              <div className="combogroupmaster-form-field half">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="IsMultiSelect"
                    className="combogroupmaster-custom-checkbox"
                    checked={form.IsMultiSelect}
                    onChange={handleChange}
                  />
                  Multi Select
                </label>
              </div>
            </div>

            <div className="combogroupmaster-form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="IsActive"
                  className="combogroupmaster-custom-checkbox"
                  checked={form.IsActive}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <div className="combogroupmaster-modal-footer">
              {editId && (
                <button
                  className="combogroupmaster-btn-delete-red"
                  onClick={() => handleDelete(editId)}
                >
                  Delete
                </button>
              )}
              <button className="combogroupmaster-btn-cancel-grey" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="combogroupmaster-btn-save-orange" onClick={handleSave}>
                {editId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISH MAPPING MODAL */}
      {showDishModal && (
        <div className="combogroupmaster-modal-overlay" onClick={() => setShowDishModal(false)}>
          <div className="combogroupmaster-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="combogroupmaster-modal-header">
              <h2>{editMappingId ? "Edit Dish Mapping" : "Add Dish Mapping"}</h2>
            </div>

            <div className="combogroupmaster-form-field">
              <label>Combo Group *</label>
              <select
                name="ComboGroupId"
                value={dishForm.ComboGroupId}
                onChange={handleDishChange}
                className="combogroupmaster-select"
                disabled={!!editMappingId}
              >
                <option value="">Select Combo Group</option>
                {comboGroups.filter(g => g.IsActive).map(group => (
                  <option key={group.ComboGroupId} value={group.ComboGroupId}>
                    {group.GroupName}
                  </option>
                ))}
              </select>
            </div>

            <div className="combogroupmaster-form-field">
              <label>Dish *</label>
              <div className="combogroupmaster-search-dropdown">
                <input
                  type="text"
                  placeholder="Search Dish..."
                  value={dishSearch}
                  onChange={(e) => {
                    setDishSearch(e.target.value);
                    setShowDishDropdown(true);
                    if (!e.target.value) {
                      setDishForm({ ...dishForm, DishId: "" });
                    }
                  }}
                  onFocus={() => setShowDishDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowDishDropdown(false), 200);
                  }}
                  className="combogroupmaster-search-input"
                />
                {showDishDropdown && (
                  <div className="combogroupmaster-dropdown-list">
                    {getFilteredDishes()
                      .filter(d => d.IsActive && d.IsCombo !== 1)
                      .length === 0 ? (
                      <div className="combogroupmaster-dropdown-item no-results">
                        No dishes found
                      </div>
                    ) : (
                      getFilteredDishes()
                        .filter(d => d.IsActive && d.IsCombo !== 1)
                        .map(dish => (
                          <div
                            key={dish.DishId}
                            className={`combogroupmaster-dropdown-item ${
                              dishForm.DishId === dish.DishId ? 'selected' : ''
                            }`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleDishSelect(dish)}
                          >
                            {dish.DishCode} - {dish.Name}
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="combogroupmaster-form-row">
              <div className="combogroupmaster-form-field half">
                <label>Surcharge</label>
                <input
                  type="number"
                  name="Surcharge"
                  step="0.01"
                  min="0"
                  value={dishForm.Surcharge}
                  onChange={handleDishChange}
                />
              </div>
              <div className="combogroupmaster-form-field half">
                <label>Sort Order</label>
                <input
                  type="number"
                  name="SortOrder"
                  min="0"
                  value={dishForm.SortOrder}
                  onChange={handleDishChange}
                />
              </div>
            </div>

            <div className="combogroupmaster-form-row">
              <div className="combogroupmaster-form-field half">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="IsDefault"
                    className="combogroupmaster-custom-checkbox"
                    checked={dishForm.IsDefault}
                    onChange={handleDishChange}
                  />
                  Is Default
                </label>
              </div>
              <div className="combogroupmaster-form-field half">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="IsActive"
                    className="combogroupmaster-custom-checkbox"
                    checked={dishForm.IsActive}
                    onChange={handleDishChange}
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="combogroupmaster-modal-footer">
              {editMappingId && (
                <button
                  className="combogroupmaster-btn-delete-red"
                  onClick={() => handleDeleteDish(editMappingId)}
                >
                  Remove
                </button>
              )}
              <button className="combogroupmaster-btn-cancel-grey" onClick={() => setShowDishModal(false)}>
                Cancel
              </button>
              <button className="combogroupmaster-btn-save-orange" onClick={handleSaveDish}>
                {editMappingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComboGroupMaster;