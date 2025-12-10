/**
 * Hook React para gerenciar um Set de valores
 * Permite adicionar/remover valores facilmente
 */

import { useState, useCallback } from 'react';

export interface UseToggleSetReturn<T> {
  /** O conjunto atual de valores */
  set: Set<T>;
  
  /** Adiciona ou remove um valor */
  toggle: (value: T) => void;
  
  /** Adiciona múltiplos valores */
  add: (values: T[]) => void;
  
  /** Remove múltiplos valores */
  remove: (values: T[]) => void;
  
  /** Verifica se um valor está no set */
  has: (value: T) => boolean;
  
  /** Limpa todos os valores */
  clear: () => void;
  
  /** Define um novo set */
  setSet: (set: Set<T>) => void;
  
  /** Retorna o tamanho atual */
  size: number;
  
  /** Retorna se está vazio */
  isEmpty: boolean;
}

/**
 * Hook para gerenciar um Set de valores com facilidade
 * 
 * @example
 * const { set, toggle, has } = useToggleSet<number>();
 * 
 * toggle(1); // Adiciona 1
 * toggle(1); // Remove 1
 * has(1);    // false
 */
export function useToggleSet<T>(
  initial: Set<T> = new Set()
): UseToggleSetReturn<T> {
  const [set, setSet] = useState<Set<T>>(initial);

  // Alterna um valor (add/remove)
  const toggle = useCallback((value: T) => {
    setSet(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  // Adiciona múltiplos valores
  const add = useCallback((values: T[]) => {
    setSet(prev => {
      const next = new Set(prev);
      values.forEach(v => next.add(v));
      return next;
    });
  }, []);

  // Remove múltiplos valores
  const remove = useCallback((values: T[]) => {
    setSet(prev => {
      const next = new Set(prev);
      values.forEach(v => next.delete(v));
      return next;
    });
  }, []);

  // Verifica se um valor existe
  const has = useCallback((value: T): boolean => {
    return set.has(value);
  }, [set]);

  // Limpa todos os valores
  const clear = useCallback(() => {
    setSet(new Set());
  }, []);

  return {
    set,
    toggle,
    add,
    remove,
    has,
    clear,
    setSet,
    size: set.size,
    isEmpty: set.size === 0,
  };
}