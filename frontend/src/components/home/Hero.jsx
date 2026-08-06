import { Button } from "@/components/ui/button";

function Hero({ navigate }) {
  return (
    <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">

        <div>
          <span className="inline-block bg-white/20 px-4 py-2 rounded-full mb-6">
            🇵🇰 Pakistan's Smart Service Marketplace
          </span>

          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
            Find Trusted
            <br />
            Workers Near You
          </h1>

          <p className="mt-6 text-lg text-slate-200">
            Electrician, AC Repair, Plumber, Painter,
            Driver, Solar Installer and hundreds of
            verified professionals.
          </p>

          <div className="flex gap-4 mt-8">
            <Button onClick={() => navigate("/services")}>
              Find Services
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/register")}
            >
              Become Worker
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=700"
            alt="Worker"
            className="rounded-3xl shadow-2xl"
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;