function Header() {
  return (
    <header className="bg-purple h-14 w-full flex items-center justify-between px-8 py-2 text-yellow">
      <div>GetAways</div>
      <div className="flex items-center gap-2">
        <div className="size-10 bg-yellow rounded-full"></div>
        <span>@PlayerName</span>
      </div>
    </header>
  );
}

export default Header;
