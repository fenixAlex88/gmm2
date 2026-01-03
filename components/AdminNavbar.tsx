'use client';

import { LayoutDashboard, BarChart3, Globe, LogOut } from 'lucide-react';
import GenericNavbar from './GenericNavbar';

const ADMIN_LINKS = [
	{ title: 'Артыкулы', href: '/admin', icon: <LayoutDashboard size={16} /> },
	{ title: 'Аналітыка', href: '/admin/analytics', icon: <BarChart3 size={16} /> },
	{ title: 'На сайт', href: '/', icon: <Globe size={16} /> },
	{ title: 'Выхад', href: '/api/logout', icon: <LogOut size={16} />, highlight: true }
];

export default function AdminNavbar() {
	return <GenericNavbar links={ADMIN_LINKS} />;
}