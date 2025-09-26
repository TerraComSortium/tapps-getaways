function Aside() {
  return (
    <aside className="flex flex-col gap-5 border-r border-purple min-h-[calc(100dvh-3.5rem)] px-8 py-4 w-80">
      <div className="flex-col gap-2 hidden">
        <button className="min-w-max bg-purple text-white py-1.5 px-5 rounded-full">
          Wish List
        </button>
        <button className="min-w-max bg-purple text-white py-1.5 px-5 rounded-full">
          Shop List
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <button className="min-w-max bg-purple text-white py-1.5 px-5 rounded-full">
          New getaway
        </button>
        <button className="min-w-max bg-purple text-white py-1.5 px-5 rounded-full">
          My getaways
        </button>
      </div>

      <div>
        GetAways Filter
        <div className="flex flex-col gap-1 items-start">
          <input type="checkbox" name="Tenis" id="" />
          <input type="checkbox" name="Padel" id="" />
          <input type="checkbox" name="PickleBall" id="" />
        </div>
      </div>

      <div>
        Budget
        <div className="flex flex-col gap-1">
          <div className="h-3 bg-purple rounded-full"></div>
          <div className="h-3 bg-purple rounded-full"></div>
          <div className="h-3 bg-purple rounded-full"></div>
          <div className="h-3 bg-purple rounded-full"></div>
        </div>
      </div>

      <div>
        Available Seats
        <div className="flex flex-col gap-1">
          <div className="h-3 bg-purple rounded-full"></div>
          <div className="h-3 bg-yellow rounded-full"></div>
          <div className="h-3 bg-green rounded-full"></div>
        </div>
      </div>
    </aside>
  );
}

export default Aside;
