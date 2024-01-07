import React, { useState, useEffect } from "react";
import Button from "./Button";


const DeleteButton = ({ onDelete }) => {
  const [confirm, setConfirm] = useState(false);
  const [disabled, setDisabled] = useState(false);
  let timer;

  useEffect(() => {
    return () => {
      clearTimeout(timer);
    };
  }, [timer]);

  const handleDelete = () => {
    if (confirm) {
      onDelete();
      setConfirm(false);
      return;
    }

    setConfirm(true);
    setDisabled(true);

    // Disable button for 0.5 seconds
    timer = setTimeout(() => {
      setDisabled(false);
    }, 1000);

    // Reset confirm state after 5 seconds if not clicked
    timer = setTimeout(() => {
      setConfirm(false);
    }, 5000);
  };

  return (
    <Button className="button" onClick={handleDelete} disabled={disabled}>
      {confirm ? "Are you sure?" : "Delete"}
    </Button>
  );
};

export default DeleteButton;
