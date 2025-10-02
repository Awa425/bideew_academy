import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';

register();

interface Slide {
  id: number;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  theme: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-cyber-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cyber-slider.component.html',
  styleUrls: ['./cyber-slider.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CyberSliderComponent {
  slides: Slide[] = [
    {
      id: 1,
      title: 'Protection des Données',
      description: 'Découvrez comment protéger vos données sensibles contre les cybermenaces avancées. Notre formation complète couvre le chiffrement, la gestion des accès et les bonnes pratiques de sécurité pour une protection optimale de vos informations critiques.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      buttonText: 'Démarrer la formation',
      buttonLink: '/courses',
      theme: 'primary'
    },
    {
      id: 2,
      title: 'Sécurité Réseau',
      description: 'Maîtrisez les techniques avancées de sécurisation des réseaux. Apprenez à configurer des pare-feu, détecter les intrusions et sécuriser les infrastructures réseau contre les cyberattaques les plus sophistiquées.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      buttonText: 'Explorer les cours',
      buttonLink: '/courses/network-security',
      theme: 'accent'
    },
    {
      id: 3,
      title: 'Cryptographie Avancée',
      description: 'Plongez dans l\'univers de la cryptographie moderne. Apprenez les algorithmes de chiffrement, les signatures numériques et les protocoles de sécurité pour protéger efficacement vos communications et données sensibles.',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
      buttonText: 'Tout savoir',
      buttonLink: '/courses/cryptography',
      theme: 'warn'
    },
    {
      id: 4,
      title: 'Test d\'Intrusion Éthique',
      description: 'Devenez expert en tests d\'intrusion éthiques. Apprenez les méthodes des hackers éthiques pour identifier et corriger les vulnérabilités avant qu\'elles ne soient exploitées par des acteurs malveillants.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      buttonText: 'S\'initier au Pentest',
      buttonLink: '/courses/pentesting',
      theme: 'primary'
    },
    {
      id: 5,
      title: 'Sécurité Cloud',
      description: 'Maîtrisez les enjeux de la sécurité dans le cloud. Découvrez comment sécuriser vos déploiements cloud, gérer les identités et appliquer les meilleures pratiques de sécurité dans les environnements AWS, Azure et Google Cloud.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      buttonText: 'Découvrir les formations',
      buttonLink: '/courses/cloud-security',
      theme: 'accent'
    }
  ];

  swiperConfig: SwiperOptions = {
    effect: 'fade',
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    keyboard: {
      enabled: true,
    },
    speed: 1000,
  };
}
