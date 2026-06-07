export default function AppLoading({ message = "Loading..." }) {
  return (
    <div className="app-loading">
      <div className="app-spinner mr-2" />
      {message}
    </div>
  );
}
