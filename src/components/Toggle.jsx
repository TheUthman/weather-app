import "./Toggle.css";

const Toggle = ({ isOn, onClick }) => {
  return (
    <button className={`toggle-btn ${isOn ? "active" : ""}`} onClick={onClick}>
      <span className="toggle-slider"></span>
    </button>
  );
};

export default Toggle;
