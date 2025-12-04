import React, { memo, useCallback } from "react";

function ProfileForm({ values, onChange, onSubmit }) {
  const handleChangeName = useCallback(
    (e) => onChange("name", e.target.value),
    [onChange]
  );

  const handleChangePhone = useCallback(
    (e) => onChange("phone", e.target.value),
    [onChange]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      
      {/* Name */}
      <div className="form-group">
        <label>Name</label>
        <input
          value={values.name}
          onChange={handleChangeName}
          placeholder="Your full name"
          required
        />
      </div>

      {/* Phone */}
      <div className="form-group">
        <label>Phone</label>
        <input
          value={values.phone}
          onChange={handleChangePhone}
          placeholder="Phone number (optional)"
        />
      </div>

      <button type="submit" className="btn-primary">
        Save Profile
      </button>
    </form>
  );
}

export default memo(ProfileForm);
