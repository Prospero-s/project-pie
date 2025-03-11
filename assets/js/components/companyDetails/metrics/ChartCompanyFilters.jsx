import React, { useState } from 'react';

const FilterSystem = ({filterValues, setFilterValues}) => {
  // Définition de l'array de filtres
  const filters = [
    { name: 'startDate', type: 'date', label: 'Date de début' },
    { name: 'endDate', type: 'date', label: 'Date de fin' },
    { name: 'sector', type: 'text', label: 'Secteur' },
    { name: 'status', type: 'select', label: 'Statut', options: [
      { value: 'active', label: 'Actif' },
      { value: 'inactive', label: 'Inactif' },
      { value: 'pending', label: 'En attente' }
    ]},
    { name: 'priority', type: 'select', label: 'Priorité', options: [
      { value: 'high', label: 'Haute' },
      { value: 'medium', label: 'Moyenne' },
      { value: 'low', label: 'Basse' }
    ]},
    { name: 'amount', type: 'number', label: 'Montant' }
  ];

  // État pour stocker les valeurs des filtres

  // Gestion des changements de valeur
  const handleFilterChange = (name, value) => {
    setFilterValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  };

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    console.log('Filtres appliqués:', filterValues);
    // Ici vous pouvez ajouter la logique pour filtrer vos données
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFilterValues({});
  };

  // Fonction pour générer le champ de filtre approprié selon le type
  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'date':
        return (
          <input
            type="date"
            id={filter.name}
            name={filter.name}
            value={filterValues[filter.name] || ''}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
            className="px-3 py-2 border rounded"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={filter.name}
            name={filter.name}
            value={filterValues[filter.name] || ''}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
            className="px-3 py-2 border rounded"
          />
        );
      case 'select':
        return (
          <select
            id={filter.name}
            name={filter.name}
            value={filterValues[filter.name] || ''}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Sélectionner...</option>
            {filter.options && filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'text':
      default:
        return (
          <input
            type="text"
            id={filter.name}
            name={filter.name}
            value={filterValues[filter.name] || ''}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
            className="px-3 py-2 border rounded"
          />
        );
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Système de Filtres</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {filters.map(filter => (
          <div key={filter.name} className="mb-2">
            <label htmlFor={filter.name} className="block text-sm font-medium mb-1">
              {filter.label}
            </label>
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2 mt-4">
        <button 
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Appliquer les filtres
        </button>
        <button 
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Réinitialiser
        </button>
      </div>
      
      <div className="mt-4 p-2 bg-gray-100 rounded">
        <p className="font-semibold">Valeurs actuelles des filtres:</p>
        <pre className="text-sm mt-1">
          {JSON.stringify(filterValues, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FilterSystem;