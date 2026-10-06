import { DocShell } from "@/components/partners/DocShell";
import { loadPartnerPack } from "@/lib/partnerPack";

export const metadata = { title: "On-site guide" };

export default async function OnSitePage() {
  const { producer } = await loadPartnerPack();

  return (
    <DocShell
      slug="on-site"
      facts={[
        { label: "Dress", value: "All black" },
        { label: "Arrive", value: "At your call time" },
        { label: "Crew names", value: "7 days before" },
        { label: "On-site contact", value: producer.name },
      ]}
    >
      <p>
        How we work at every Main Hall event. It&apos;s short, and it keeps things smooth for
        you, the venue, and our clients.
      </p>

      <h2>Before the day</h2>
      <ul>
        <li>Send your crew names at least 7 days before, so the venue can make badges.</li>
        <li>Check your loading time and parking details in the portal.</li>
        <li>Test and charge everything the night before.</li>
      </ul>

      <h2>Arriving</h2>
      <ul>
        <li>Arrive at your call time. Don&apos;t arrive before your loading slot.</li>
        <li>Tap &ldquo;I&apos;ve arrived&rdquo; in the portal, then find the producer.</li>
        <li>Keep your badge visible all day.</li>
      </ul>

      <h2>Dress</h2>
      <p>All black, closed-toe shoes, no logos or slogans.</p>

      <h2>During the event</h2>
      <ul>
        <li>Phones on silent in any room with guests.</li>
        <li>Stay out of guest areas unless you&apos;re working there.</li>
        <li>Crew meals are provided. Please don&apos;t take guest food or drinks.</li>
        <li>No alcohol while working, including at receptions.</li>
        <li>If guests or press ask you questions, point them to a Main Hall team member.</li>
      </ul>

      <h2>Photos and social media</h2>
      <p>No photos, videos, or posts from the event without written OK from Main Hall.</p>

      <h2>Safety</h2>
      <ul>
        <li>Follow venue rules and instructions from venue staff.</li>
        <li>Tape down cables and never block exits or walkways.</li>
        <li>Report any injury or damage to the producer straight away.</li>
        <li>If something feels unsafe, stop and call the producer.</li>
      </ul>

      <h2>If something goes wrong</h2>
      <p>
        Call the producer first: {producer.name}, {producer.phone}. Running late?
        Call as soon as you know.
      </p>

      <h2>Leaving</h2>
      <ul>
        <li>Pack up on schedule and leave your area clean.</li>
        <li>Check out with the producer before you leave.</li>
      </ul>
    </DocShell>
  );
}
