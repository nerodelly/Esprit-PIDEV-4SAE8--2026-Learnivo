import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Clock, MapPin, CheckSquare, Play } from 'lucide-angular';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent implements OnInit {
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly MapPinIcon = MapPin;
  readonly CheckSquareIcon = CheckSquare;
  readonly PlayIcon = Play;

  eventsData: Record<string, any> = {
    "freelancer-networking-night": {
      title: "Master Skills Like a Pro: The Hands-On Workshop You Can't Afford to Miss!",
      badge: "Past event",
      description: "Tired of boring lectures? Get ready to roll up your sleeves and dive into action! This event is all about hands-on training, real-world skills, and practical learning that will supercharge your expertise.",
      date: "Friday, 16 August 2023",
      time: "From 9:20 am to 18:30 pm",
      location: "Sahloul, Sousse, Tunisia",
      image: "/images/event-1.jpg",
      overview: "Say goodbye to passive learning and hello to real, hands-on experience! This workshop is designed to bridge the gap between theory and practice, giving you the tools, techniques, and confidence to apply your knowledge instantly. Led by industry experts, this event will help you learn by doing, ensuring you leave with skills that make an impact.",
      expectations: [
        "Hands-on Workshops - No fluff, just practical training you can use immediately.",
        "Expert-Led Sessions - Learn from top professionals in your field.",
        "Live Demos & Real-World Scenarios - See how it's done and try it yourself.",
        "Networking & Collaboration - Connect with like-minded learners and mentors.",
        "Certificates & Bonus Resources - Walk away with proof of your new skills!",
      ],
      album: ["/images/album-1.jpg", "/images/album-2.jpg", "/images/album-3.jpg", "/images/album-4.jpg"],
    },
    "mastering-contracts-workshop": {
      title: "These are designed to provide hands training and skill-building.",
      badge: "Next event",
      description: "Stay connected and inspired with our latest gatherings, workshops, and networking opportunities. Explore upcoming events and be part of a thriving community!",
      date: "Saturday, 2 December 2023",
      time: "From 11:13 am to 14:45 pm",
      location: "Ambassadeurs Hotel, Tunis",
      image: "/images/training-1.jpg",
      overview: "Jungle in English est l'academie dont vous avez besoin pour ameliorer votre anglais et vous debarrasser des difficultes que vous avez toujours eues.",
      expectations: [
        "Interactive Workshops - Engage in hands-on activities led by industry experts.",
        "Live Demonstrations - Witness real-time applications of key concepts.",
        "Skill-Building Sessions - Learn practical techniques to apply in your profession.",
        "Networking Opportunities - Connect with like-minded professionals and mentors.",
        "Certification & Takeaways - Gain valuable credentials and resources for continued growth.",
      ],
      album: ["/images/album-1.jpg", "/images/album-2.jpg", "/images/album-3.jpg", "/images/album-4.jpg"],
    },
  };

  event = signal<any>(null);

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.event.set(this.eventsData[slug] || this.eventsData['freelancer-networking-night']);
    });
  }
}
