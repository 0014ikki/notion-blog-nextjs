import Link from 'next/link';

const navItems = [
  { label: 'TOP', page: '/' },
  // { label: 'ABOUT', page: '/about' },
  // { label: 'PROFILE', page: '/profile' },
]

const Navigation = ({ titlePre = '', ogImageUrl = '', description = '', slug = '' }) => {

  return (
    <header className="navi">
      <figure className="logos">
        <img src="/ICON.png" /> 
      </figure>
      <ul className="list-none">
        {navItems.map(({ label, page, link }) => (
          <li key={label}>
            {page ? (
              <Link href={page} prefetch={false}>
                <a>{label}</a>
              </Link>
            ) : (
              <ExtLink href={link}>{label}</ExtLink>
            )}
          </li>
        ))}
      </ul>
    </header>
  )
}

export default Navigation