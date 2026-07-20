import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const CustomSelect = ({ value, onChange, options, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      options.findIndex((opt) => opt.value === value),
    ),
  );

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const listboxId = useId();

  const selectedIndex = useMemo(
    () =>
      Math.max(
        0,
        options.findIndex((opt) => opt.value === value),
      ),
    [options, value],
  );

  const selectedOption = options[selectedIndex] || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[activeIndex]?.focus();
  }, [isOpen, activeIndex]);

  const closeMenu = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const openMenu = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        openMenu();
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(selectedIndex);
        setIsOpen(true);
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          closeMenu();
        }
        break;
      default:
        break;
    }
  };

  const handleOptionKeyDown = (event, index) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const nextIndex = (index + 1) % options.length;
        setActiveIndex(nextIndex);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prevIndex = (index - 1 + options.length) % options.length;
        setActiveIndex(prevIndex);
        break;
      }
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleSelect(options[index].value);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`custom-select-container ${isOpen ? "open" : ""}`}
      data-select-name={name}
      ref={dropdownRef}
    >
      <button
        id={name}
        ref={triggerRef}
        type="button"
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
      >
        <span>{selectedOption.label}</span>
        <FiChevronDown className="chevron-icon" />
      </button>

      {isOpen && (
        <ul className="custom-select-options" id={listboxId} role="listbox">
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isActive = index === activeIndex;

            return (
              <li key={opt.value} role="presentation">
                <button
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-select-option ${isSelected ? "selected" : ""} ${isActive ? "active" : ""}`}
                  onClick={() => handleSelect(opt.value)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
