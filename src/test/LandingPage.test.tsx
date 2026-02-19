import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from '../pages/LandingPage'

describe('LandingPage', () => {
  it('renderiza o título principal', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(
      screen.getByText(/controle total dos preços do mercado/i)
    ).toBeInTheDocument()
  })

  it('renderiza o botão "Começar agora"', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const btn = screen.getByRole('link', { name: /começar agora/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('href', '/signup')
  })

  it('renderiza as 3 features da landing page', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Monitoramento inteligente')).toBeInTheDocument()
    expect(screen.getByText('Filtros profissionais')).toBeInTheDocument()
    expect(screen.getByText('Login seguro')).toBeInTheDocument()
  })
})