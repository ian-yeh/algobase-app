const Logo = () => {
  return (
    <div>
      <div className="relative w-8 h-8 mr-3">
        <div className="absolute w-8 h-8 border-2 border-foreground rotate-45 transform transition-all duration-300 hover:rotate-[135deg]"></div>
        <div className="absolute w-8 h-8 border-2 border-foreground rotate-[15deg] transform transition-all duration-300 hover:rotate-[105deg]"></div>
      </div>
    </div>
  )
}

export default Logo
