package com.smartneighbour.config;

import com.smartneighbour.entity.*;
import com.smartneighbour.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final SafetyReportRepository safetyReportRepository;
    private final CommunityEventRepository eventRepository;
    private final CommunityAnnouncementRepository announcementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data setup.");
            return;
        }

        log.info("Seeding initial community data for Pondicherry township...");

        // 1. Users (Resident & Admin)
        User admin = User.builder()
                .fullName("Srikumar")
                .email("admin@oakridge.community")
                .password(passwordEncoder.encode("admin123"))
                .phone("+91 98401 23456")
                .apartmentNumber("101")
                .block("Block A (Society Office)")
                .role(Role.ADMIN)
                .trustPoints(98)
                .profileImage("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                .active(true)
                .build();
        userRepository.save(admin);

        User sanjay = User.builder()
                .fullName("Sanjay Kumar")
                .email("sanjay@oakridge.community")
                .password(passwordEncoder.encode("admin123"))
                .phone("+91 94432 10987")
                .apartmentNumber("205")
                .block("Block A")
                .role(Role.ADMIN)
                .trustPoints(92)
                .profileImage("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150")
                .active(true)
                .build();
        userRepository.save(sanjay);

        User arun = User.builder()
                .fullName("Arunachalam V.")
                .email("arun@oakridge.community")
                .password(passwordEncoder.encode("admin123"))
                .phone("+91 97890 12345")
                .apartmentNumber("312")
                .block("Block C")
                .role(Role.ADMIN)
                .trustPoints(90)
                .profileImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .active(true)
                .build();
        userRepository.save(arun);

        User priya = User.builder()
                .fullName("Priya Sharma")
                .email("priya.sharma@oakridge.community")
                .password(passwordEncoder.encode("resident123"))
                .phone("+91 98765 43210")
                .apartmentNumber("402")
                .block("Block B")
                .role(Role.RESIDENT)
                .trustPoints(88)
                .profileImage("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                .active(true)
                .build();
        userRepository.save(priya);

        User rajesh = User.builder()
                .fullName("Rajesh Verma")
                .email("rajesh.verma@oakridge.community")
                .password(passwordEncoder.encode("resident123"))
                .phone("+91 91234 56789")
                .apartmentNumber("508")
                .block("Block B")
                .role(Role.RESIDENT)
                .trustPoints(82)
                .profileImage("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150")
                .active(true)
                .build();
        userRepository.save(rajesh);

        // 2. Marketplace Items
        Item drill = Item.builder()
                .name("Bosch Cordless Power Drill Set")
                .description("18V Lithium-Ion cordless drill with 2 rechargeable battery packs and 30-piece bits.")
                .category(ItemCategory.TOOLS)
                .imageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600")
                .owner(sanjay)
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .build();
        itemRepository.save(drill);

        Item ladder = Item.builder()
                .name("12ft Aluminum Telescoping Extension Ladder")
                .description("Lightweight, rated for 150 kg. Extends smoothly and locks at every rung.")
                .category(ItemCategory.TOOLS)
                .imageUrl("https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600")
                .owner(priya)
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .build();
        itemRepository.save(ladder);

        // 3. Safety Reports in Pondicherry Heritage Township
        SafetyReport report1 = SafetyReport.builder()
                .reporter(priya)
                .title("Flickering Streetlight Near Rue Suffren Gate")
                .description("The pole lamp next to the visitor pedestrian entry has been blinking continuously after 9 PM.")
                .category(SafetyCategory.LIGHTING)
                .severity(SafetySeverity.MEDIUM)
                .latitude(11.9324)
                .longitude(79.8298)
                .block("Promenade Gate")
                .location("Rue Suffren Pedestrian Gate Entrance")
                .status(SafetyStatus.VERIFIED)
                .build();
        safetyReportRepository.save(report1);

        SafetyReport report2 = SafetyReport.builder()
                .reporter(rajesh)
                .title("Water Leakage Near Romain Rolland Lift Lobby")
                .description("Slippery puddle forming directly in front of passenger elevator B2. Potential slip hazard.")
                .category(SafetyCategory.WATER)
                .severity(SafetySeverity.HIGH)
                .latitude(11.9349)
                .longitude(79.8322)
                .block("Block B")
                .location("Romain Rolland Wing - Ground Floor Elevator B2")
                .status(SafetyStatus.PENDING)
                .build();
        safetyReportRepository.save(report2);

        SafetyReport report3 = SafetyReport.builder()
                .reporter(sanjay)
                .title("Unlatched Pedestrian Side Gate at Night")
                .description("The small magnetic latch on North Gate fails to auto-lock after 11 PM. Security team notified.")
                .category(SafetyCategory.SECURITY)
                .severity(SafetySeverity.HIGH)
                .latitude(11.9360)
                .longitude(79.8305)
                .block("North Gate")
                .location("North Perimeter Pedestrian Access")
                .status(SafetyStatus.VERIFIED)
                .build();
        safetyReportRepository.save(report3);

        // 4. Community Events in Pondicherry
        CommunityEvent yoga = CommunityEvent.builder()
                .title("Pondicherry Sunrise Yoga & Sea Breeze Mindfulness")
                .description("Open to all age groups and beginners! Bring your own yoga mat and water bottle for a crisp morning relaxation session.")
                .eventDate(LocalDate.now().plusDays(3))
                .startTime(LocalTime.of(7, 0))
                .endTime(LocalTime.of(8, 15))
                .location("Promenade Seaside Terrace & Deck")
                .latitude(11.9336)
                .longitude(79.8338)
                .category(EventCategory.SPORTS)
                .status(EventStatus.UPCOMING)
                .organizer(priya)
                .imageUrl("https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500")
                .build();
        eventRepository.save(yoga);

        CommunityEvent cleanup = CommunityEvent.builder()
                .title("Promenade Beach Cleanliness & Coastal Drive")
                .description("Community cleanup along Promenade beachfront. Gloves, trash pickers, and biodegradable bags will be provided to all volunteers.")
                .eventDate(LocalDate.now().plusDays(6))
                .startTime(LocalTime.of(8, 30))
                .endTime(LocalTime.of(11, 0))
                .location("Central Botanical Lawn Forecourt")
                .latitude(11.9347)
                .longitude(79.8314)
                .category(EventCategory.CLEANUP)
                .status(EventStatus.UPCOMING)
                .organizer(sanjay)
                .imageUrl("https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500")
                .build();
        eventRepository.save(cleanup);

        CommunityEvent treePlanting = CommunityEvent.builder()
                .title("Green Haven Community Tree Planting Drive")
                .description("Join us in planting 50 native fruit and shade saplings across the podium garden. Plant tags with your family name will be attached!")
                .eventDate(LocalDate.now().plusDays(9))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 30))
                .location("Podium Garden & East Park")
                .latitude(11.9328)
                .longitude(79.8310)
                .category(EventCategory.TREE_PLANTING)
                .status(EventStatus.UPCOMING)
                .organizer(arun)
                .imageUrl("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500")
                .build();
        eventRepository.save(treePlanting);

        CommunityEvent bloodDonation = CommunityEvent.builder()
                .title("Annual Society Blood Donation Camp")
                .description("Organized in association with JIPMER Red Cross. Certified doctors will be present. Refreshments and certificates provided.")
                .eventDate(LocalDate.now().plusDays(14))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(15, 0))
                .location("Community Club House Main Hall")
                .latitude(11.9355)
                .longitude(79.8325)
                .category(EventCategory.BLOOD_DONATION)
                .status(EventStatus.UPCOMING)
                .organizer(admin)
                .imageUrl("https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=500")
                .build();
        eventRepository.save(bloodDonation);

        CommunityEvent festival = CommunityEvent.builder()
                .title("Diwali Lantern & Rangoli Cultural Evening")
                .description("Bring your family for light decorations, music performance, and home-cooked sweet sharing on the central terrace.")
                .eventDate(LocalDate.now().plusDays(20))
                .startTime(LocalTime.of(18, 0))
                .endTime(LocalTime.of(21, 30))
                .location("Amphitheatre & Central Plaza")
                .latitude(11.9340)
                .longitude(79.8330)
                .category(EventCategory.FESTIVAL)
                .status(EventStatus.UPCOMING)
                .organizer(priya)
                .imageUrl("https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=500")
                .build();
        eventRepository.save(festival);

        // Pre-register organizers as participants for initial counts
        eventParticipantRepository.save(EventParticipant.builder().event(yoga).user(priya).build());
        eventParticipantRepository.save(EventParticipant.builder().event(yoga).user(sanjay).build());
        eventParticipantRepository.save(EventParticipant.builder().event(cleanup).user(sanjay).build());
        eventParticipantRepository.save(EventParticipant.builder().event(treePlanting).user(arun).build());
        eventParticipantRepository.save(EventParticipant.builder().event(bloodDonation).user(admin).build());
        eventParticipantRepository.save(EventParticipant.builder().event(festival).user(priya).build());

        // 5. Announcements
        CommunityAnnouncement announcement = CommunityAnnouncement.builder()
                .title("Annual Coastal Township Maintenance & Solar Inverter Check")
                .content("Technicians will perform scheduled safety inspections of rooftop solar panels and backup generators this Saturday between 10 AM and 2 PM.")
                .author(admin)
                .active(true)
                .build();
        announcementRepository.save(announcement);

        log.info("Seeding completed successfully with default Pondicherry township data.");
    }
}
