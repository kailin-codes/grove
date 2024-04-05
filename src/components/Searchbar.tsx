import styles from "@/styles/searchbar.module.css";
import { Transition } from "@headlessui/react";
import Router from "next/router";
import * as React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { trpc } from "@/utils/trpc";

interface SearchbarProps extends React.HTMLAttributes<HTMLDivElement> {
  route: string;
}

const Searchbar = ({ route, className }: SearchbarProps) => {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const suggestionsQuery = trpc.products.getSuggestions.useQuery(
    { query },
    {
      enabled: query.length > 0,
      keepPreviousData: true,
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      Router.push(`/app/search?q=${encodeURIComponent(query)}`);
    }
  };

  const showSuggestions = isOpen && query.length > 0;

  return (
    <form onSubmit={handleSearch} className={`relative w-full max-w-5xl ${className}`}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.input}
          placeholder={`Search ${route}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <button type="submit" aria-label="search" className={styles.inputButton}>
          <MagnifyingGlassIcon
            className="aspect-square w-6 stroke-2 text-title"
            aria-hidden="true"
          />
        </button>
      </div>
      <Transition
        show={showSuggestions}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        {(ref) => (
          <div ref={ref} className={styles.options}>
            <div
              className={styles.optionSearch}
              onClick={() => {
                Router.push(`/app/search?q=${encodeURIComponent(query)}`);
              }}
            >
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              <span>Search for &quot;{query}&quot;</span>
            </div>
            {suggestionsQuery.data?.map((suggestion, index) => (
              <div
                key={index}
                className={styles.option}
                onClick={() => {
                  setQuery(suggestion.query);
                  Router.push(`/app/search?q=${encodeURIComponent(suggestion.query)}`);
                }}
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                <span>{suggestion.query}</span>
                <span className="ml-auto text-xs text-gray-500">in {suggestion.category}</span>
              </div>
            ))}
          </div>
        )}
      </Transition>
    </form>
  );
};

export default Searchbar;
