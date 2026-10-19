import { useState } from 'react';
import '../styles/profile.css'; 

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    username: 'Lambang_seto',
    email: 'Lambangseto@gmail.com',
    phone: '+14987889999',
    password: 'Lambangjossjiss'
  });

  // Fitur menyembunyikan/menampilkan password
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdate = () => {
    alert('Data Profil berhasil diperbarui!');
  };

  const handleLogout = () => {
    alert('Anda telah Log Out.');
  };

  return (
    <div className="profile-page-container">
      
      {/* Banner Hijau Muda */}
      <div className="profile-hero"></div>

      <div className="profile-content-wrapper">
        
        {/* Kotak Kartu Profil */}
        <div className="profile-card">
          
          {/* Avatar Inisial */}
          <div className="profile-avatar">
            {profileData.username.charAt(0).toUpperCase()}
          </div>

          <h2 className="profile-name-title">Lambang</h2>
          <p className="profile-subtitle">Kelola informasi data dirimu di sini</p>

          <div className="profile-form">
            <div className="profile-form-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                value={profileData.username} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={profileData.email} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                value={profileData.phone} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="password">Password</label>
              {/* Type berubah dinamis antara "text" dan "password" */}
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                name="password" 
                value={profileData.password} 
                onChange={handleInputChange} 
              />
              {/* Tombol Tampilkan Password */}
              <button 
                type="button" 
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
          </div>

          <div className="profile-buttons-wrapper">
            <button className="btn-profile-update" onClick={handleUpdate}>
              Simpan Perubahan
            </button>
            <button className="btn-profile-logout" onClick={handleLogout}>
              Keluar Akun
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;