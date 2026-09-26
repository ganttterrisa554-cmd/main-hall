import { DocShell } from "@/components/partners/DocShell";
import { pack } from "@/data/partnerPack";

export const metadata = { title: "Event brief" };

const schedule = [
  ["Wed, Oct 21", "1:00 PM", "Load-in and setup"],
  ["Wed, Oct 21", "6:00 PM", "Setup finished, sound check"],
  ["Thu, Oct 22", "6:30 AM", "Crew call"],
  ["Thu, Oct 22", "8:00 AM", "Doors open, breakfast (background music)"],
  ["Thu, Oct 22", "9:00 AM", "Opening keynote"],
  ["Thu, Oct 22", "10:30 AM – 4:00 PM", "Panels on the main stage, sessions in side rooms"],
  ["Thu, Oct 22", "4:30 PM", "Closing remarks"],
  ["Thu, Oct 22", "5:00 PM", "Reception (background music only)"],
  ["Thu, Oct 22", "7:00 PM", "Event ends, pack-up starts"],
  ["Thu, Oct 22", "11:00 PM", "Everything out of the venue"],
];

export default function BriefPage() {
  const { event, producer } = pack;

  return (
    <DocShell
      slug="brief"
      facts={[
        { label: "Event day", value: "Thu, Oct 22, 2026" },
        { label: "Setup", value: "Wed, Oct 21 · 1 PM" },
        { label: "Venue", value: `${event.venue}, Austin` },
        { label: "Guests", value: `About ${event.guests}` },
      ]}
    >
      <h2>At a glance</h2>
      <table>
        <tbody>
          <tr>
            <th>Client</th>
            <td>{event.client}, an energy company</td>
          </tr>
          <tr>
            <th>Event</th>
            <td>{event.name}: a one-day meeting for their senior leaders</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>
              {event.date}, with setup on {event.setup}
            </td>
          </tr>
          <tr>
            <th>Venue</th>
            <td>
              {event.venue}, {event.address}
            </td>
          </tr>
          <tr>
            <th>Guests</th>
            <td>About {event.guests}</td>
          </tr>
          <tr>
            <th>Your role</th>
            <td>Sound, screens, and projection for the whole event</td>
          </tr>
        </tbody>
      </table>

      <h2>Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>What&apos;s happening</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(([day, time, what]) => (
            <tr key={`${day}-${time}`}>
              <td>{day}</td>
              <td>{time}</td>
              <td>{what}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>The work</h2>
      <h3>Main stage</h3>
      <ul>
        <li>Sound system for about 650 seated guests, run from a mixing desk in the room.</li>
        <li>4 handheld wireless mics and 6 clip-on mics for speakers and panels.</li>
        <li>Walk-up music and short video sound when speakers come on stage.</li>
        <li>1 large center LED screen (about 20 × 11 ft) for slides.</li>
        <li>2 side LED screens showing the speaker on camera.</li>
        <li>A screen at the front of the stage so speakers can see their slides.</li>
        <li>Slide playback from a laptop you run, with a backup laptop.</li>
      </ul>
      <h3>Side rooms (Room A seats 80, Room B seats 60)</h3>
      <ul>
        <li>1 projector and screen in each room.</li>
        <li>2 wireless mics and a small speaker system in each room.</li>
      </ul>

      <h2>Who provides what</h2>
      <table>
        <thead>
          <tr>
            <th>Who</th>
            <th>Provides</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>The venue</td>
            <td>Stage, house power, house lights, loading access, and a venue contact on the day</td>
          </tr>
          <tr>
            <td>Main Hall</td>
            <td>
              Final schedule, speaker slides by Oct 19, a producer on site, crew meals, and
              parking for 2 vehicles
            </td>
          </tr>
          <tr>
            <td>You</td>
            <td>
              All sound, screen, and projection equipment above, cables, backup mics, and the
              crew to set up, run, and pack up
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Getting in</h2>
      <p>
        Load in through the venue&apos;s stage door. We&apos;ll send your exact loading time
        and parking details 1 week before the event. Send us your crew names by October 15 so
        the venue can prepare badges.
      </p>

      <h2>Dress</h2>
      <p>All black, closed-toe shoes, no logos.</p>

      <h2>Contact</h2>
      <p>
        {producer.name}, producer (on site both days): {producer.phone}
      </p>
    </DocShell>
  );
}
