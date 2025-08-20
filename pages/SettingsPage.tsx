import React, { useState, useEffect } from 'react';
import { Cog8ToothIcon, BellAlertIcon, ShieldExclamationIcon, UserCircleIcon, KeyIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../hooks/useAppData';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const SettingsPage: React.FC = () => {
  const { authUser } = useAuth();
  const { academySettings, updateAcademySettings } = useAppData();
  
  const [logoUrl, setLogoUrl] = useState(academySettings.logoUrl);
  const [backgroundUrl, setBackgroundUrl] = useState(academySettings.backgroundUrl);

  useEffect(() => {
    setLogoUrl(academySettings.logoUrl);
    setBackgroundUrl(academySettings.backgroundUrl);
  }, [academySettings]);

  const handleSaveVisuals = () => {
    updateAcademySettings({ logoUrl, backgroundUrl });
  };


  if (authUser?.role === 'student') {
    return (
      <div className="space-y-8">
        <div className="p-4 bg-academy-secondary rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-academy-text">Minhas Configurações</h2>
          <p className="text-academy-text-secondary mt-1">Gerencie seu perfil e suas preferências.</p>
        </div>

        <div className="bg-academy-secondary p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <UserCircleIcon className="h-8 w-8 text-academy-accent mr-3"/>
            <h3 className="text-xl font-semibold text-academy-text">Informações do Perfil</h3>
          </div>
          <p className="text-academy-text-secondary mb-2">Suas informações de perfil atuais são:</p>
          <ul className="list-disc list-inside text-academy-text-secondary space-y-1">
            <li>Nome: {authUser.name}</li>
            <li>ID do Aluno: {authUser.id}</li>
            {/* You could fetch more student details here if needed from useAppData */}
          </ul>
          <p className="text-academy-text-secondary mt-3">Para atualizar seus detalhes de contato ou outras informações, por favor, fale com um instrutor.</p>
        </div>
        
        <div className="bg-academy-secondary p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <KeyIcon className="h-8 w-8 text-academy-accent mr-3"/>
            <h3 className="text-xl font-semibold text-academy-text">Segurança da Conta</h3>
          </div>
          <p className="text-academy-text-secondary">Sua senha é o seu ano de nascimento (AAAA).</p>
          <p className="text-academy-text-secondary mt-1">Para maior segurança em versões futuras, as opções de alteração de senha estarão disponíveis aqui.</p>
        </div>

      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-8">
      <div className="p-4 bg-academy-secondary rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-academy-text">Configurações da Aplicação</h2>
        <p className="text-academy-text-secondary mt-1">Gerencie as preferências e configurações da sua academia.</p>
      </div>
      
      <div className="bg-academy-secondary p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <PaintBrushIcon className="h-8 w-8 text-academy-accent mr-3"/>
          <h3 className="text-xl font-semibold text-academy-text">Identidade Visual</h3>
        </div>
        <div className="space-y-4">
          <Input 
            label="URL do Logo da Academia" 
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://exemplo.com/logo.png"
          />
           {logoUrl && <img src={logoUrl} alt="Pré-visualização do Logo" className="h-12 w-auto bg-gray-800 p-1 rounded-md mb-2"/>}
          <Input 
            label="URL da Imagem de Fundo (Página de Login)" 
            value={backgroundUrl}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            placeholder="https://exemplo.com/fundo.jpg"
          />
           {backgroundUrl && <img src={backgroundUrl} alt="Pré-visualização do Fundo" className="w-32 h-20 object-cover rounded-md mb-2"/>}
           <div className="pt-2">
              <Button variant="primary" size="sm" onClick={handleSaveVisuals}>Salvar Identidade Visual</Button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-academy-secondary p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <Cog8ToothIcon className="h-8 w-8 text-academy-accent mr-3"/>
            <h3 className="text-xl font-semibold text-academy-text">Preferências Gerais</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="academyName" className="block text-sm font-medium text-academy-text-secondary">Nome da Academia</label>
              <input type="text" id="academyName" defaultValue="Meu Dojo Incrível" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-academy-accent focus:border-academy-accent sm:text-sm text-academy-text"/>
            </div>
            <div>
              <label htmlFor="timeZone" className="block text-sm font-medium text-academy-text-secondary">Fuso Horário</label>
              <select id="timeZone" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-academy-accent focus:border-academy-accent sm:text-sm text-academy-text">
                <option>(GMT-03:00) Horário de Brasília</option>
                <option>(GMT-04:00) Horário do Amazonas</option>
              </select>
            </div>
             <div className="pt-2">
                <Button variant="primary" size="sm">Salvar Preferências Gerais</Button>
            </div>
          </div>
        </div>

        <div className="bg-academy-secondary p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <BellAlertIcon className="h-8 w-8 text-academy-accent mr-3"/>
            <h3 className="text-xl font-semibold text-academy-text">Configurações de Notificação</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-academy-text-secondary">E-mails para novas promoções</span>
              <label htmlFor="promoEmails" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" id="promoEmails" className="sr-only peer" defaultChecked/>
                  <div className="w-10 h-6 rounded-full bg-gray-600 peer-checked:bg-academy-accent-hover transition"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white peer-checked:bg-academy-accent peer-checked:translate-x-full transition transform"></div>
                </div>
              </label>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-sm text-academy-text-secondary">Alertas para pagamentos atrasados</span>
              <label htmlFor="paymentAlerts" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" id="paymentAlerts" className="sr-only peer" defaultChecked/>
                  <div className="w-10 h-6 rounded-full bg-gray-600 peer-checked:bg-academy-accent-hover transition"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white peer-checked:bg-academy-accent peer-checked:translate-x-full transition transform"></div>
                </div>
              </label>
            </div>
             <div className="pt-2">
                <Button variant="primary" size="sm">Salvar Configurações de Notificação</Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-academy-secondary p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
            <ShieldExclamationIcon className="h-8 w-8 text-academy-accent mr-3"/>
            <h3 className="text-xl font-semibold text-academy-text">Sistema de Faixas (Alinhado à CBJJ)</h3>
        </div>
        <p className="text-academy-text-secondary">
            Esta aplicação usa um sistema de progressão de faixas alinhado com os requisitos da CBJJ.
            A personalização de tempo mínimo de faixa ou requisitos de idade pode estar disponível em versões futuras.
        </p>
        <p className="text-xs text-academy-text-secondary mt-2">Atualmente, o sistema sugere promoções automaticamente com base em regras simplificadas predefinidas para as categorias Infantil, Juvenil e Adulto.</p>
      </div>
    </div>
  );
};

export default SettingsPage;