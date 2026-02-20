import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'

// Mock da função de API para não fazer chamadas reais
vi.mock('../api/auth', () => ({
  verifyEmailRequest: vi.fn(),
}))

describe('VerifyEmailPage', () => {
  it('mostra erro quando não há token na URL', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(
      screen.getByText(/token de verificação ausente/i)
    ).toBeInTheDocument()
  })
})