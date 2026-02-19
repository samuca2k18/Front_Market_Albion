import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from '../pages/NotFoundPage'

describe('NotFoundPage', () => {
  it('renderiza a mensagem de página não encontrada', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    expect(screen.getByText(/foi movido/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voltar/i })).toBeInTheDocument()
  })

  it('link "Voltar" aponta para a home', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /voltar/i })
    expect(link).toHaveAttribute('href', '/')
  })
})