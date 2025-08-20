import React, { useState, ChangeEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../contexts/AuthContext';
import { GalleryItem } from '../types';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { PhotoIcon, VideoCameraIcon, PlusIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const GalleryPage: React.FC = () => {
  const { galleryItems, addGalleryItem, deleteGalleryItem, addNotification } = useAppData();
  const { authUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemCaption, setNewItemCaption] = useState('');
  const [newItemType, setNewItemType] = useState<'photo' | 'video'>('photo');

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const isAdmin = authUser?.role === 'admin';

  const openViewModal = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const handleAddItem = () => {
    if(!newItemUrl) {
        addNotification({type: 'error', message: 'A URL da imagem/vídeo é obrigatória.'});
        return;
    }
    addGalleryItem({
        type: newItemType,
        url: newItemUrl,
        caption: newItemCaption,
        dateAdded: new Date().toISOString().split('T')[0]
    });
    setNewItemUrl('');
    setNewItemCaption('');
    setNewItemType('photo');
    setIsAddModalOpen(false);
  };

  const handleDeleteRequest = (id: string) => {
    setItemToDeleteId(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDeleteId) {
      deleteGalleryItem(itemToDeleteId);
    }
    setIsConfirmDeleteOpen(false);
    setItemToDeleteId(null);
  };


  return (
    <div className="space-y-6">
      <div className="p-4 bg-academy-secondary rounded-lg shadow flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-academy-text">Galeria da Academia ({galleryItems.length})</h2>
        {isAdmin && <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<PlusIcon className="h-5 w-5"/>}>Adicionar Mídia</Button>}
      </div>

      {galleryItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryItems.map(item => (
            <div
              key={item.id}
              className="group bg-academy-secondary rounded-lg shadow-lg overflow-hidden cursor-pointer relative"
            >
              <div onClick={() => openViewModal(item)} className="w-full h-full">
                <img
                  src={item.type === 'photo' ? item.url : `https://picsum.photos/seed/${item.id}/300/200`} // Placeholder for video thumbnail
                  alt={item.caption || 'Item da galeria'}
                  className="w-full h-48 object-cover group-hover:opacity-75 transition-opacity"
                  onError={(e) => (e.currentTarget.src = 'https://picsum.photos/300/200?grayscale')}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                  {item.type === 'photo' ? <PhotoIcon className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" /> : <VideoCameraIcon className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
                {item.caption && (
                  <div className="p-3">
                    <p className="text-sm text-academy-text truncate">{item.caption}</p>
                    <p className="text-xs text-academy-text-secondary">{new Date(item.dateAdded).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
               {isAdmin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(item.id);
                    }}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-academy-secondary focus:ring-red-500 transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir item"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-academy-secondary rounded-lg shadow">
            <PhotoIcon className="h-12 w-12 mx-auto text-academy-text-secondary mb-4" />
            <p className="text-xl text-academy-text-secondary">A galeria está vazia no momento.</p>
            {isAdmin && <p className="text-sm text-academy-text-secondary mt-2">Adicione algumas fotos ou vídeos para começar!</p>}
        </div>
      )}

      {/* View Media Modal */}
      <Modal isOpen={isModalOpen && selectedItem !== null} onClose={() => setIsModalOpen(false)} title={selectedItem?.caption || "Ver Mídia"} size="lg">
        {selectedItem && (
          <div>
            {selectedItem.type === 'photo' ? (
              <img src={selectedItem.url} alt={selectedItem.caption || "Imagem da galeria"} className="max-w-full max-h-[70vh] rounded-md mx-auto" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/600/400?grayscale')} />
            ) : (
              // Basic video placeholder, could be an iframe for actual video later
              <div className="bg-black aspect-video rounded-md flex items-center justify-center">
                 <VideoCameraIcon className="h-24 w-24 text-gray-500" />
                 <p className="absolute text-white">Placeholder do Player de Vídeo para: {selectedItem.url}</p>
              </div>
            )}
            {selectedItem.caption && <p className="mt-3 text-center text-academy-text-secondary">{selectedItem.caption}</p>}
             <p className="mt-1 text-xs text-center text-academy-text-secondary">Adicionado em: {new Date(selectedItem.dateAdded).toLocaleDateString('pt-BR')}</p>
          </div>
        )}
      </Modal>
      
      {/* Add Media Modal */}
      {isAdmin && (
        <>
          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Nova Mídia">
              <div className="space-y-4">
                  <Input label="URL da Mídia" placeholder="https://exemplo.com/imagem.jpg ou url_do_video" value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} />
                  <Input label="Legenda (Opcional)" value={newItemCaption} onChange={e => setNewItemCaption(e.target.value)} />
                  <Select 
                      label="Tipo"
                      options={[{value: 'photo', label: 'Foto'}, {value: 'video', label: 'Vídeo'}]}
                      value={newItemType}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewItemType(e.target.value as 'photo' | 'video')}
                  />
                  <div className="flex justify-end space-x-2 pt-2">
                      <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                      <Button variant="primary" onClick={handleAddItem}>Adicionar Mídia</Button>
                  </div>
              </div>
          </Modal>

          <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Exclusão" size="sm">
            <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-academy-text-secondary mb-4">Tem certeza que deseja excluir este item da galeria? A ação não pode ser desfeita.</p>
                <div className="flex justify-center space-x-4">
                    <Button variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmDelete}>Excluir Item</Button>
                </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default GalleryPage;