import Aside from "../components/Aside";
import Header from "../components/Header";
import SearchIcon from "../icons/SearchIcon";

function Store() {
  return (
    <div>
      <Header />
      <div className="flex">
        <Aside />
        <div className="w-full">
          <div className="bg-purple text-white flex flex-col gap-5 py-5 px-4">
            <span>
              Search your next Racquets!TM getaway | Live the full experience
            </span>

            <div className="flex items-center gap-2">
              <input
                className="bg-white px-2 py-1 rounded-xl placeholder:text-purple text-purple"
                type="text"
                placeholder="City"
              />
              <div className="flex items-center gap-1">
                <input
                  className="bg-white px-2 py-1 rounded-xl text-purple placeholder:text-purple"
                  type="date"
                  name=""
                  id=""
                />
                <input
                  className="bg-white px-2 py-1 rounded-xl text-purple placeholder:text-purple"
                  type="date"
                  name=""
                  id=""
                />
              </div>
              <select
                name=""
                id=""
                className="bg-white py-1 rounded-xl text-purple px-4"
              >
                <option value="">Tenis</option>
                <option value="">Padel</option>
                <option value="">Pickleball</option>
              </select>

              <button className="bg-yellow text-purple p-2 rounded-xl">
                <SearchIcon sizes={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
