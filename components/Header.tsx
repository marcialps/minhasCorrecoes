
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold mb-2 leading-tight">
          Gerador de Feedback Inteligente
        </h1>
        <p className="text-lg opacity-90">
          Apoie professores no processo de correção e devolutiva de atividades, gerando mensagens personalizadas de retorno para cada aluno.
        </p>
      </div>
    </header>
  );
};

export default Header;
