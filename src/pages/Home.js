import { useEffect, useState } from "react";
import "./Home.css";
import { BASE_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaTags, FaLayerGroup, FaClipboardList } from "react-icons/fa";

function StatCard({ 
  title, 
  total, 
  active, 
  inactive, 
  activeLabel, 
  inactiveLabel, 
  icon: Icon,
  onClick
}) {
  return (
    <div className="home-card" onClick={onClick}>
      <h3>
        {Icon && <Icon className="card-icon" />}
        {title}
      </h3>

      <div className="home-card-total">
        {total} <span>total</span>
      </div>

      <div className="home-stats-row">
        <span className="home-active">
          {activeLabel || "Active"}: {active}
        </span>

        <span className="home-inactive">
          {inactiveLabel || "Inactive"}: {inactive}
        </span>
      </div>
    </div>
  );
}

function Home() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/api/dashboard`)
      .then(res => res.json())
      .then(res => setData(res))
      .catch(err => console.log(err));
  }, []);

  if (!data) return <div className="home-loading">Loading dashboard…</div>;

  const cards = [
    { title: "Kitchen",    total: data.kitchen_total,   active: data.kitchen_active,   inactive: data.kitchen_inactive,   icon: FaUtensils,onClick: () => navigate("/Contact") },
    { title: "Category",   total: data.category_total,  active: data.category_active,  inactive: data.category_inactive,  icon: FaTags,onClick: () => navigate("/About") },
    { title: "Dish Group", total: data.dishgroup_total,  active: data.dishgroup_active,  inactive: data.dishgroup_inactive,  icon: FaLayerGroup,onClick: () => navigate("/DishGroup") },
    { title: "Dish",       total: data.dish_total,       active: data.dish_active,       inactive: data.dish_inactive,       icon: FaClipboardList,onClick: () => navigate("/Dish") },
  ];

  return (
    <div className="home-dashboard">
      <div className="home-header">
        <div>
          <h1 className="home-title">Dashboard</h1>
          <p className="home-subtitle">Welcome back — here's an overview of your POS data.</p>
        </div>
      </div>

      <div className="home-cards">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

export default Home;