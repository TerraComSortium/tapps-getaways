import Aside from "../components/Aside";
import Header from "../components/Header";

function Getaways() {
  return (
    <div>
      <Header />
      <div className="flex">
        <Aside />
        <div className="border w-full px-5 py-8 flex flex-col gap-1">
          <h1>My getaways</h1>
          <span>You have # getaways registered</span>

          <div className="flex items-center border h-40 pl-4 w-full">
            <div className="grow flex flex-col">
              <span>LADIES TENNIS RETREAT</span>
              <span>2023 Pricing Starts</span>
              <span>Double Occupancy $3,720 + Tax / Person</span>
              <span>Double Occupancy $4,797 + Tax</span>

              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1">
                  <span className="size-4 rounded-full bg-green"></span>
                  Published
                </div>
                <span>Players (15)</span>
              </div>
            </div>
            <div className="bg-purple w-72 h-full flex items-end justify-center py-5">
              <button className="bg-green px-5 py-1 rounded-full">
                Edit Getaways
              </button>
            </div>
          </div>

          {/* <div className="flex items-center border h-40 pl-4 w-full">
            <div className="grow flex flex-col">
              <span>LADIES TENNIS RETREAT</span>
              <span>2023 Pricing Starts</span>
              <span>Double Occupancy $3,720 + Tax / Person</span>
              <span>Double Occupancy $4,797 + Tax</span>

              <div>
                <span>Published</span>
                <span>Players (15)</span>
              </div>
            </div>
            <div className="bg-purple w-72 h-full"></div>
          </div>

          <div className="flex items-center border h-40 pl-4 w-full">
            <div className="grow flex flex-col">
              <span>LADIES TENNIS RETREAT</span>
              <span>2023 Pricing Starts</span>
              <span>Double Occupancy $3,720 + Tax / Person</span>
              <span>Double Occupancy $4,797 + Tax</span>

              <div>
                <span>Published</span>
                <span>Players (15)</span>
              </div>
            </div>
            <div className="bg-purple w-72 h-full"></div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Getaways;
