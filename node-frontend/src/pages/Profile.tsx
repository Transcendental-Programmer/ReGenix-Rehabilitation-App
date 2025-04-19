// import React, { useState, useEffect } from 'react';
// import { Check, Edit2, UserCircle, Mail, Lock, Info } from 'lucide-react';
// import Card, { CardContent, CardHeader } from '../components/Card';
// import Button from '../components/Button';
// import { useAuth } from '../context/AuthContext';

// interface UserProfile {
//   id: string;
//   name: string;
//   email: string;
//   profilePicture?: string;
//   injuryType?: string;
//   injuryDate?: string;
//   therapistName?: string;
//   therapistEmail?: string;
// }

// const Profile: React.FC = () => {
//   const { user, updateProfile } = useAuth();
//   const [profile, setProfile] = useState<UserProfile | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState<Partial<UserProfile>>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     // For demo, create a profile with the user info plus some mock data
//     if (user) {
//       setProfile({
//         id: user.id,
//         name: user.name || 'John Doe',
//         email: user.email,
//         injuryType: 'Rotator Cuff Tear',
//         injuryDate: '2024-09-15',
//         therapistName: 'Dr. Sarah Johnson',
//         therapistEmail: 'sarah.johnson@rehab.medical'
//       });
//     }
//   }, [user]);

//   const handleEditToggle = () => {
//     if (isEditing) {
//       // Cancel editing, reset form data
//       setFormData({});
//       setError('');
//       setSuccess('');
//     } else {
//       // Start editing, initialize form data with current profile
//       setFormData({ ...profile });
//     }
//     setIsEditing(!isEditing);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       // In a real app, send the data to the backend
//       // await updateProfile(formData);

//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // Update local profile data
//       setProfile({
//         ...profile!,
//         ...formData
//       });

//       setSuccess('Profile updated successfully!');
//       setIsEditing(false);
//       setIsLoading(false);
//     } catch (err: any) {
//       setError(err.message || 'Failed to update profile');
//       setIsLoading(false);
//     }
//   };

//   if (!profile) {
//     return (
//       <div className="min-h-[80vh] flex items-center justify-center">
//         <p>Loading profile...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//         <div>
//           <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
//           <p className="text-dark-300">
//             Manage your personal information and rehabilitation details
//           </p>
//         </div>
//         <Button
//           variant={isEditing ? 'ghost' : 'primary'}
//           icon={isEditing ? <Check /> : <Edit2 />}
//           iconPosition="left"
//           onClick={handleEditToggle}
//         >
//           {isEditing ? 'Cancel' : 'Edit Profile'}
//         </Button>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-error-900/30 border border-error-700 rounded-md text-error-400">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="mb-6 p-4 bg-success-900/30 border border-success-700 rounded-md text-success-400">
//           {success}
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-1">
//           <Card>
//             <CardHeader>
//               <h2 className="text-xl font-semibold">Personal Information</h2>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-col items-center mb-6">
//                 <div className="w-32 h-32 rounded-full bg-dark-700 flex items-center justify-center mb-4">
//                   {profile.profilePicture ? (
//                     <img 
//                       src={profile.profilePicture} 
//                       alt={profile.name} 
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   ) : (
//                     <UserCircle size={80} className="text-dark-500" />
//                   )}
//                 </div>
//                 <h3 className="text-xl font-medium">{profile.name}</h3>
//                 <p className="text-dark-300">{profile.email}</p>
//               </div>

//               {/* <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-dark-300 mb-1">Account ID</label>
//                   <p className="bg-dark-800 p-2 rounded-md text-dark-200 truncate">{profile.id}</p>
//                 </div>

//                 <div className="mt-6">
//                   <Button variant="outline" className="w-full" icon={<Lock />} iconPosition="left">
//                     Change Password
//                   </Button>
//                 </div>
//               </div> */}




//             </CardContent>
//           </Card>
//         </div>

//         <div className="lg:col-span-2">
//           <Card>
//             <CardHeader>
//               <h2 className="text-xl font-semibold">Rehabilitation Information</h2>
//             </CardHeader>
//             <CardContent>
//               {isEditing ? (
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-1">
//                         Full Name
//                       </label>
//                       <input
//                         id="name"
//                         name="name"
//                         type="text"
//                         value={formData.name || ''}
//                         onChange={handleInputChange}
//                         className="input"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-1">
//                         Email Address
//                       </label>
//                       <input
//                         id="email"
//                         name="email"
//                         type="email"
//                         value={formData.email || ''}
//                         onChange={handleInputChange}
//                         className="input"
//                         required
//                         disabled  // Email shouldn't be editable in this UI
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="injuryType" className="block text-sm font-medium text-dark-300 mb-1">
//                         Injury Type
//                       </label>
//                       <input
//                         id="injuryType"
//                         name="injuryType"
//                         type="text"
//                         value={formData.injuryType || ''}
//                         onChange={handleInputChange}
//                         className="input"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="injuryDate" className="block text-sm font-medium text-dark-300 mb-1">
//                         Injury Date
//                       </label>
//                       <input
//                         id="injuryDate"
//                         name="injuryDate"
//                         type="date"
//                         value={formData.injuryDate || ''}
//                         onChange={handleInputChange}
//                         className="input"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="therapistName" className="block text-sm font-medium text-dark-300 mb-1">
//                         Therapist Name
//                       </label>
//                       <input
//                         id="therapistName"
//                         name="therapistName"
//                         type="text"
//                         value={formData.therapistName || ''}
//                         onChange={handleInputChange}
//                         className="input"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="therapistEmail" className="block text-sm font-medium text-dark-300 mb-1">
//                         Therapist Email
//                       </label>
//                       <input
//                         id="therapistEmail"
//                         name="therapistEmail"
//                         type="email"
//                         value={formData.therapistEmail || ''}
//                         onChange={handleInputChange}
//                         className="input"
//                       />
//                     </div>
//                   </div>

//                   <div className="flex justify-end space-x-4 pt-4">
//                     <Button 
//                       type="button" 
//                       variant="ghost" 
//                       onClick={handleEditToggle}
//                     >
//                       Cancel
//                     </Button>
//                     <Button 
//                       type="submit" 
//                       variant="primary" 
//                       isLoading={isLoading}
//                     >
//                       Save Changes
//                     </Button>
//                   </div>
//                 </form>
//               ) : (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
//                     <div>
//                       <h3 className="text-sm font-medium text-dark-300 mb-1">Injury Type</h3>
//                       <p className="text-lg">{profile.injuryType || 'Not specified'}</p>
//                     </div>

//                     <div>
//                       <h3 className="text-sm font-medium text-dark-300 mb-1">Injury Date</h3>
//                       <p className="text-lg">
//                         {profile.injuryDate 
//                           ? new Date(profile.injuryDate).toLocaleDateString('en-US', {
//                               year: 'numeric',
//                               month: 'long',
//                               day: 'numeric'
//                             }) 
//                           : 'Not specified'}
//                       </p>
//                     </div>

//                     <div>
//                       <h3 className="text-sm font-medium text-dark-300 mb-1">Therapist Name</h3>
//                       <p className="text-lg">{profile.therapistName || 'Not assigned'}</p>
//                     </div>

//                     <div>
//                       <h3 className="text-sm font-medium text-dark-300 mb-1">Therapist Email</h3>
//                       <p className="text-lg">
//                         {profile.therapistEmail ? (
//                           <a href={`mailto:${profile.therapistEmail}`} className="text-primary-400 hover:text-primary-300">
//                             {profile.therapistEmail}
//                           </a>
//                         ) : (
//                           'Not assigned'
//                         )}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="bg-dark-700 p-4 rounded-lg mt-8 flex items-start">
//                     <Info size={20} className="text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
//                     <p className="text-dark-200">
//                       This information helps customize your rehabilitation plan. Keep it updated for the best results.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import React, { useState, useEffect } from 'react';
import { Check, Edit2, UserCircle, Info } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  age?: number;
  height?: string;
  weight?: string;
  gender?: 'male' | 'female';
}


const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // For demo, create a profile with the user info plus some mock data
    if (user) {
      setProfile({
        id: user.id,
        name: user.name || 'John Doe',
        email: user.email,
        age: 35,
        height: '175 cm',
        weight: '70 kg',
        gender: 'male' // or 'female'
      });
      
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form data
      setFormData({});
      setError('');
      setSuccess('');
    } else {
      // Start editing, initialize form data with current profile
      setFormData({ ...profile });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, send the data to the backend
      // await updateProfile(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local profile data
      setProfile({
        ...profile!,
        ...formData
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-dark-300">
            Manage your personal information
          </p>
        </div>
        <Button
          variant={isEditing ? 'ghost' : 'primary'}
          icon={isEditing ? <Check /> : <Edit2 />}
          iconPosition="left"
          onClick={handleEditToggle}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-900/30 border border-error-700 rounded-md text-error-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success-900/30 border border-success-700 rounded-md text-success-400">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Profile</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full bg-dark-700 flex items-center justify-center mb-4">
                  {(() => {
                    const seeds = [
                      'Blaze', 'Shadow', 'Nova', 'Jett', 'Zane', 'Maverick', 'Ace', 'Ryder',
                      'Knox', 'Axel', 'Dash', 'Hunter', 'Xeno'
                    ];

                    const getSwagAvatar = (name: string, gender: string = 'male') => {
                      const index = name ? (name[0].toUpperCase().charCodeAt(0) - 65) % 13 : 0;
                      const seed = seeds[index];
                      const style = gender.toLowerCase() === 'female' ? 'lorelei' : 'micah';
                      return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`;
                    };

                    const avatarUrl = profile.profilePicture || getSwagAvatar(profile.name, profile.gender || 'male');

                    return (
                      <img
                        src={avatarUrl}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover border-4 border-dark-500 shadow-lg"
                      />
                    );
                  })()}


                </div>
                <h3 className="text-xl font-medium">{profile.name}</h3>
                <p className="text-dark-300">{profile.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="input"
                        required
                        disabled  // Email shouldn't be editable in this UI
                      />
                    </div>

                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-dark-300 mb-1">
                        Age
                      </label>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age || ''}
                        onChange={handleInputChange}
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-dark-300 mb-1">
                        Height
                      </label>
                      <input
                        id="height"
                        name="height"
                        type="text"
                        value={formData.height || ''}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="e.g., 175 cm"
                      />
                    </div>

                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-dark-300 mb-1">
                        Weight
                      </label>
                      <input
                        id="weight"
                        name="weight"
                        type="text"
                        value={formData.weight || ''}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="e.g., 70 kg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
                    <div>
                      <h3 className="text-sm font-medium text-dark-300 mb-1">Age</h3>
                      <p className="text-lg">{profile.age || 'Not specified'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-dark-300 mb-1">Height</h3>
                      <p className="text-lg">{profile.height || 'Not specified'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-dark-300 mb-1">Weight</h3>
                      <p className="text-lg">{profile.weight || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="bg-dark-700 p-4 rounded-lg mt-8 flex items-start">
                    <Info size={20} className="text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-dark-200">
                      Keep your personal information updated for the best experience.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;