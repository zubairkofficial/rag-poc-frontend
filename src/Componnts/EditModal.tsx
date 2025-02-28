// import React from "react";

// interface EditModalProps {
//   isOpen: boolean;
//   title?: string;
//   name: string;
//   onChangeName: (name: string) => void;
//   message?: string;
//   confirmText?: string;
//   cancelText?: string;
//   onConfirm: () => void;
//   onCancel: () => void;
// }

// const EditModal: React.FC<EditModalProps> = ({
//   isOpen,
//   title = "Edit Chat Name",
//   confirmText = "Delete",
//   cancelText = "Cancel",
//   name,
//   onChangeName,
//   onConfirm,
//   onCancel,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-xs z-50">
//       <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
//         {/* Header */}
//         <h2 className="text-xl font-semibold text-gray-600">{title}</h2>

        
       
//         <div>
//             <label htmlFor="">
//                 <span className="text-gray-600">Name</span>
//             </label>
//             <input value={name} onChange={(e)=>onChangeName(e.target.value)} type="text" name="" id="" />
//         </div>

//         {/* Buttons */}
//         <div className="mt-4 flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition hover:cursor-pointer"
//           >
//             {cancelText}
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 hover:cursor-pointer transition"
//           >
//             {confirmText}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditModal;


import React, { useEffect, useState } from "react";

interface EditModalProps {
  isOpen: boolean;
  title?: string;
  name: string;
  onChangeName: (name: string) => void;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  title = "Edit Chat Name",
  confirmText = "Update",
  cancelText = "Cancel",
  name,
  onChangeName,
  onConfirm,
  onCancel,
}) => {
  const [error, setError] = useState("");

  if (!isOpen) return null;
  

  const handleBlur = () => {
    if (!name.trim()) {
      setError("Name should not be empty");
    } else {
      setError("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-xs z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-semibold text-gray-600">{title}</h2>

        <div className="mt-3">
          <label htmlFor="name" className="block text-gray-600">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
              error ? "border-red-500" : "border-gray-300"
            } focus:border-purple-700`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition hover:cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 hover:cursor-pointer transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

