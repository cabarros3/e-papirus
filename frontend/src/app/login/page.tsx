export default function Login() {
  return (
    <div className="card-login">
      <div className="form-content">
        <h1>e-Papirus</h1>

        <form>
          <input type="text" name="usuario" placeholder="E-mail" />
          <input type="password" name="senha" placeholder="Senha" />
          <button type="submit">Fazer Login</button>
        </form>

        <p className="info-text">Primeiro acesso? Cadastre-se aqui</p>
      </div>
    </div>
  );
}